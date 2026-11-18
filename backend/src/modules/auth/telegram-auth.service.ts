import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { AuthChallenge, User } from '../../database/entities/core.entity.js';
import { IdentityService } from './identity.service.js';
import { TelegramIdTokenVerifier } from './telegram-id-token-verifier.js';

export interface TelegramChallenge {
  nonce: string;
  expiresAt: Date;
}

@Injectable()
export class TelegramAuthService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AuthChallenge)
    private readonly challenges: Repository<AuthChallenge>,
    private readonly identityService: IdentityService,
    private readonly verifier: TelegramIdTokenVerifier,
  ) {}

  async createLoginChallenge(): Promise<TelegramChallenge> {
    return this.createChallenge('login');
  }

  async createLinkChallenge(userId: string): Promise<TelegramChallenge> {
    return this.createChallenge('link', userId);
  }

  async authenticate(idToken: string): Promise<User> {
    const identity = await this.verifier.verify(idToken);
    return this.dataSource.transaction(async (manager) => {
      const challenge = await manager.getRepository(AuthChallenge).findOne({
        where: { nonceHash: this.hash(identity.nonce) },
        lock: { mode: 'pessimistic_write' },
      });

      if (
        !challenge ||
        challenge.purpose !== 'login' ||
        challenge.consumedAt ||
        challenge.expiresAt.getTime() <= Date.now()
      ) {
        throw new UnauthorizedException(
          'Invalid or expired Telegram challenge.',
        );
      }

      challenge.consumedAt = new Date();
      await manager.getRepository(AuthChallenge).save(challenge);
      return this.identityService.findOrCreate(
        manager,
        'telegram',
        identity.subject,
        identity.displayName ?? 'Telegram learner',
      );
    });
  }

  async link(userId: string, idToken: string): Promise<void> {
    const identity = await this.verifier.verify(idToken);
    await this.dataSource.transaction(async (manager) => {
      const challenge = await manager.getRepository(AuthChallenge).findOne({
        where: { nonceHash: this.hash(identity.nonce) },
        lock: { mode: 'pessimistic_write' },
      });

      if (
        !challenge ||
        challenge.purpose !== 'link' ||
        challenge.requestedForUserId !== userId ||
        challenge.consumedAt ||
        challenge.expiresAt.getTime() <= Date.now()
      ) {
        throw new UnauthorizedException(
          'Invalid or expired Telegram challenge.',
        );
      }

      challenge.consumedAt = new Date();
      await manager.getRepository(AuthChallenge).save(challenge);
      await this.identityService.link(
        manager,
        userId,
        'telegram',
        identity.subject,
      );
    });
  }

  private async createChallenge(
    purpose: 'login' | 'link',
    requestedForUserId?: string,
  ): Promise<TelegramChallenge> {
    const nonce = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 5 * 60_000);
    const requestedForUser = requestedForUserId
      ? ({ id: requestedForUserId } as User)
      : null;

    await this.challenges.save(
      this.challenges.create({
        provider: 'telegram',
        purpose,
        requestedForUser,
        nonceHash: this.hash(nonce),
        expiresAt,
        consumedAt: null,
      }),
    );

    return { nonce, expiresAt };
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
