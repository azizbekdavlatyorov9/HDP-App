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
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { AuthChallenge } from '../../database/entities/core.entity.js';
import { IdentityService } from './identity.service.js';
import { TelegramIdTokenVerifier } from './telegram-id-token-verifier.js';
let TelegramAuthService = class TelegramAuthService {
    dataSource;
    challenges;
    identityService;
    verifier;
    constructor(dataSource, challenges, identityService, verifier) {
        this.dataSource = dataSource;
        this.challenges = challenges;
        this.identityService = identityService;
        this.verifier = verifier;
    }
    async createLoginChallenge() {
        return this.createChallenge('login');
    }
    async createLinkChallenge(userId) {
        return this.createChallenge('link', userId);
    }
    async authenticate(idToken) {
        const identity = await this.verifier.verify(idToken);
        return this.dataSource.transaction(async (manager) => {
            const challenge = await manager.getRepository(AuthChallenge).findOne({
                where: { nonceHash: this.hash(identity.nonce) },
                lock: { mode: 'pessimistic_write' },
            });
            if (!challenge ||
                challenge.purpose !== 'login' ||
                challenge.consumedAt ||
                challenge.expiresAt.getTime() <= Date.now()) {
                throw new UnauthorizedException('Invalid or expired Telegram challenge.');
            }
            challenge.consumedAt = new Date();
            await manager.getRepository(AuthChallenge).save(challenge);
            return this.identityService.findOrCreate(manager, 'telegram', identity.subject, identity.displayName ?? 'Telegram learner');
        });
    }
    async link(userId, idToken) {
        const identity = await this.verifier.verify(idToken);
        await this.dataSource.transaction(async (manager) => {
            const challenge = await manager.getRepository(AuthChallenge).findOne({
                where: { nonceHash: this.hash(identity.nonce) },
                lock: { mode: 'pessimistic_write' },
            });
            if (!challenge ||
                challenge.purpose !== 'link' ||
                challenge.requestedForUserId !== userId ||
                challenge.consumedAt ||
                challenge.expiresAt.getTime() <= Date.now()) {
                throw new UnauthorizedException('Invalid or expired Telegram challenge.');
            }
            challenge.consumedAt = new Date();
            await manager.getRepository(AuthChallenge).save(challenge);
            await this.identityService.link(manager, userId, 'telegram', identity.subject);
        });
    }
    async createChallenge(purpose, requestedForUserId) {
        const nonce = randomBytes(32).toString('base64url');
        const expiresAt = new Date(Date.now() + 5 * 60_000);
        const requestedForUser = requestedForUserId
            ? { id: requestedForUserId }
            : null;
        await this.challenges.save(this.challenges.create({
            provider: 'telegram',
            purpose,
            requestedForUser,
            nonceHash: this.hash(nonce),
            expiresAt,
            consumedAt: null,
        }));
        return { nonce, expiresAt };
    }
    hash(value) {
        return createHash('sha256').update(value).digest('hex');
    }
};
TelegramAuthService = __decorate([
    Injectable(),
    __param(1, InjectRepository(AuthChallenge)),
    __metadata("design:paramtypes", [DataSource,
        Repository,
        IdentityService,
        TelegramIdTokenVerifier])
], TelegramAuthService);
export { TelegramAuthService };
//# sourceMappingURL=telegram-auth.service.js.map