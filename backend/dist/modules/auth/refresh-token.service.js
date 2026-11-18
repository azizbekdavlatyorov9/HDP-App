var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RefreshTokenService_1;
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../../database/entities/core.entity.js';
let RefreshTokenService = class RefreshTokenService {
    static { RefreshTokenService_1 = this; }
    dataSource;
    refreshTokens;
    static lifetimeMs = 30 * 24 * 60 * 60 * 1000;
    constructor(dataSource, refreshTokens) {
        this.dataSource = dataSource;
        this.refreshTokens = refreshTokens;
    }
    async create(user, metadata) {
        const rawToken = this.newToken();
        await this.refreshTokens.save(this.refreshTokens.create({
            user,
            tokenHash: this.hash(rawToken),
            expiresAt: new Date(Date.now() + RefreshTokenService_1.lifetimeMs),
            revokedAt: null,
            replacedBy: null,
            userAgent: metadata.userAgent ?? null,
            ipAddress: metadata.ipAddress ?? null,
        }));
        return rawToken;
    }
    async rotate(rawToken, metadata) {
        const outcome = await this.dataSource.transaction(async (manager) => {
            const repository = manager.getRepository(RefreshToken);
            const current = await repository
                .createQueryBuilder('refreshToken')
                .leftJoinAndSelect('refreshToken.user', 'user')
                .setLock('pessimistic_write', undefined, ['refreshToken'])
                .where('refreshToken.tokenHash = :tokenHash', {
                tokenHash: this.hash(rawToken),
            })
                .getOne();
            if (!current)
                return { kind: 'invalid' };
            if (current.revokedAt) {
                await manager.query('UPDATE "refresh_tokens" SET "revoked_at" = COALESCE("revoked_at", $1) WHERE "user_id" = $2', [new Date(), current.user.id]);
                return { kind: 'reused' };
            }
            if (current.expiresAt.getTime() <= Date.now() ||
                current.user.status !== 'active' ||
                current.user.deletedAt) {
                current.revokedAt = new Date();
                await repository.save(current);
                return { kind: 'invalid' };
            }
            const nextRawToken = this.newToken();
            const next = await repository.save(repository.create({
                user: current.user,
                tokenHash: this.hash(nextRawToken),
                expiresAt: new Date(Date.now() + RefreshTokenService_1.lifetimeMs),
                revokedAt: null,
                replacedBy: null,
                userAgent: metadata.userAgent ?? null,
                ipAddress: metadata.ipAddress ?? null,
            }));
            current.revokedAt = new Date();
            current.replacedBy = next;
            await repository.save(current);
            return {
                kind: 'rotated',
                user: current.user,
                refreshToken: nextRawToken,
            };
        });
        if (outcome.kind !== 'rotated') {
            throw new UnauthorizedException('Refresh token is invalid or expired.');
        }
        return { user: outcome.user, refreshToken: outcome.refreshToken };
    }
    async revoke(userId, rawToken) {
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
            .where('"user_id" = :userId AND "token_hash" = :tokenHash AND "revoked_at" IS NULL', { userId, tokenHash: this.hash(rawToken) })
            .execute();
    }
    newToken() {
        return randomBytes(32).toString('base64url');
    }
    hash(token) {
        return createHash('sha256').update(token).digest('hex');
    }
};
RefreshTokenService = RefreshTokenService_1 = __decorate([
    Injectable(),
    __param(1, InjectRepository(RefreshToken)),
    __metadata("design:paramtypes", [DataSource,
        Repository])
], RefreshTokenService);
export { RefreshTokenService };
//# sourceMappingURL=refresh-token.service.js.map