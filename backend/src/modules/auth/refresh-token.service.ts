import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken, User } from '../../database/entities/core.entity.js';
import type { RequestMetadata } from './interfaces/authenticated-user.js';

export interface RotatedRefreshToken {
  user: User;
  refreshToken: string;
}

type RotationOutcome =
  | { kind: 'invalid' }
  | { kind: 'reused' }
  | { kind: 'rotated'; user: User; refreshToken: string };

@Injectable()
export class RefreshTokenService {
  static readonly lifetimeMs = 30 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
  ) {}

  async create(user: User, metadata: RequestMetadata): Promise<string> {
    const rawToken = this.newToken();
    await this.refreshTokens.save(
      this.refreshTokens.create({
        user,
        tokenHash: this.hash(rawToken),
        expiresAt: new Date(Date.now() + RefreshTokenService.lifetimeMs),
        revokedAt: null,
        replacedBy: null,
        userAgent: metadata.userAgent ?? null,
        ipAddress: metadata.ipAddress ?? null,
      }),
    );
    return rawToken;
  }

  async rotate(
    rawToken: string,
    metadata: RequestMetadata,
  ): Promise<RotatedRefreshToken> {
    const outcome = await this.dataSource.transaction<RotationOutcome>(
      async (manager) => {
        const repository = manager.getRepository(RefreshToken);
        const current = await repository
          .createQueryBuilder('refreshToken')
          .leftJoinAndSelect('refreshToken.user', 'user')
          .setLock('pessimistic_write', undefined, ['refreshToken'])
          .where('refreshToken.tokenHash = :tokenHash', {
            tokenHash: this.hash(rawToken),
          })
          .getOne();

        if (!current) return { kind: 'invalid' };

        if (current.revokedAt) {
          await manager.query(
            'UPDATE "refresh_tokens" SET "revoked_at" = COALESCE("revoked_at", $1) WHERE "user_id" = $2',
            [new Date(), current.user.id],
          );
          return { kind: 'reused' };
        }

        if (
          current.expiresAt.getTime() <= Date.now() ||
          current.user.status !== 'active' ||
          current.user.deletedAt
        ) {
          current.revokedAt = new Date();
          await repository.save(current);
          return { kind: 'invalid' };
        }

        const nextRawToken = this.newToken();
        const next = await repository.save(
          repository.create({
            user: current.user,
            tokenHash: this.hash(nextRawToken),
            expiresAt: new Date(Date.now() + RefreshTokenService.lifetimeMs),
            revokedAt: null,
            replacedBy: null,
            userAgent: metadata.userAgent ?? null,
            ipAddress: metadata.ipAddress ?? null,
          }),
        );

        current.revokedAt = new Date();
        current.replacedBy = next;
        await repository.save(current);
        return {
          kind: 'rotated',
          user: current.user,
          refreshToken: nextRawToken,
        };
      },
    );

    if (outcome.kind !== 'rotated') {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }
    return { user: outcome.user, refreshToken: outcome.refreshToken };
  }

  async revoke(userId: string, rawToken?: string): Promise<void> {
    if (!rawToken) {
      await this.refreshTokens
        .createQueryBuilder()
        .update(RefreshToken)
        .set({ revokedAt: new Date() })
        .where('"user_id" = :userId AND "revoked_at" IS NULL', { userId })
        .execute();
      return;
    }

    await this.refreshTokens
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where(
        '"user_id" = :userId AND "token_hash" = :tokenHash AND "revoked_at" IS NULL',
        { userId, tokenHash: this.hash(rawToken) },
      )
      .execute();
  }

  private newToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
