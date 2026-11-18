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
import { ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomInt, randomUUID, timingSafeEqual, } from 'node:crypto';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PhoneVerification, } from '../../database/entities/core.entity.js';
import { IdentityService } from './identity.service.js';
import { SmsProvider } from './sms-provider.js';
export const GENERIC_PHONE_RESPONSE = {
    message: 'If this number can receive a verification code, it will be sent.',
};
let PhoneAuthService = class PhoneAuthService {
    dataSource;
    verifications;
    identityService;
    smsProvider;
    config;
    constructor(dataSource, verifications, identityService, smsProvider, config) {
        this.dataSource = dataSource;
        this.verifications = verifications;
        this.identityService = identityService;
        this.smsProvider = smsProvider;
        this.config = config;
    }
    async requestLoginCode(rawPhoneNumber, metadata) {
        await this.requestCode(rawPhoneNumber, 'login', null, metadata);
        return GENERIC_PHONE_RESPONSE;
    }
    async requestLinkCode(rawPhoneNumber, userId, metadata) {
        await this.requestCode(rawPhoneNumber, 'link', userId, metadata);
        return GENERIC_PHONE_RESPONSE;
    }
    async verifyLoginCode(rawPhoneNumber, code) {
        const phoneNumber = this.normalizePhoneNumber(rawPhoneNumber);
        const outcome = await this.consumeCode(phoneNumber, code, 'login', null);
        if (outcome.kind !== 'authenticated') {
            throw new UnauthorizedException('Invalid or expired verification code.');
        }
        return outcome.user;
    }
    async verifyLinkCode(rawPhoneNumber, code, userId) {
        const phoneNumber = this.normalizePhoneNumber(rawPhoneNumber);
        const outcome = await this.consumeCode(phoneNumber, code, 'link', userId);
        if (outcome.kind === 'conflict') {
            throw new ConflictException('This identity is already linked.');
        }
        if (outcome.kind !== 'linked') {
            throw new UnauthorizedException('Invalid or expired verification code.');
        }
    }
    normalizePhoneNumber(input) {
        const parsed = input.startsWith('+')
            ? parsePhoneNumberFromString(input)
            : undefined;
        if (!parsed?.isValid()) {
            throw new UnauthorizedException('Invalid or expired verification code.');
        }
        return parsed.number;
    }
    async requestCode(rawPhoneNumber, purpose, requestedForUserId, metadata) {
        const phoneNumber = this.normalizePhoneNumber(rawPhoneNumber);
        const id = randomUUID();
        const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
        const now = new Date();
        const created = await this.dataSource.transaction(async (manager) => {
            await manager.query('SELECT pg_advisory_xact_lock(hashtext($1), 0)', [
                phoneNumber,
            ]);
            const repository = manager.getRepository(PhoneVerification);
            const mostRecent = await repository.findOne({
                where: { phoneNumber },
                order: { createdAt: 'DESC' },
            });
            if (mostRecent &&
                now.getTime() - mostRecent.createdAt.getTime() < 60_000) {
                return false;
            }
            const secret = this.config.get('OTP_HASH_SECRET');
            if (!secret) {
                throw new ServiceUnavailableException('Phone verification is not configured.');
            }
            const requestedForUser = requestedForUserId
                ? { id: requestedForUserId }
                : null;
            await repository.save(repository.create({
                id,
                phoneNumber,
                purpose,
                requestedForUser,
                codeHash: this.codeHash(secret, id, phoneNumber, code),
                expiresAt: new Date(now.getTime() + 5 * 60_000),
                attemptCount: 0,
                consumedAt: null,
                requestedFromIp: metadata.ipAddress ?? null,
            }));
            return true;
        });
        if (!created)
            return;
        try {
            await this.smsProvider.sendVerificationCode(phoneNumber, code);
        }
        catch {
            await this.verifications.update({ id }, { consumedAt: new Date() });
            throw new ServiceUnavailableException('Phone verification is temporarily unavailable.');
        }
    }
    async consumeCode(phoneNumber, code, purpose, requestedForUserId) {
        return this.dataSource.transaction(async (manager) => {
            await manager.query('SELECT pg_advisory_xact_lock(hashtext($1), 0)', [
                phoneNumber,
            ]);
            const repository = manager.getRepository(PhoneVerification);
            const requestedForUser = requestedForUserId
                ? { id: requestedForUserId }
                : IsNull();
            const challenge = await repository.findOne({
                where: { phoneNumber, purpose, requestedForUser },
                order: { createdAt: 'DESC' },
                lock: { mode: 'pessimistic_write' },
            });
            if (!challenge || challenge.consumedAt)
                return { kind: 'invalid' };
            const now = new Date();
            if (challenge.expiresAt.getTime() <= now.getTime()) {
                challenge.consumedAt = now;
                await repository.save(challenge);
                return { kind: 'invalid' };
            }
            if (challenge.attemptCount >= 5) {
                challenge.consumedAt = now;
                await repository.save(challenge);
                return { kind: 'invalid' };
            }
            const secret = this.config.get('OTP_HASH_SECRET');
            if (!secret) {
                throw new ServiceUnavailableException('Phone verification is not configured.');
            }
            if (!this.constantTimeEqual(challenge.codeHash, this.codeHash(secret, challenge.id, phoneNumber, code))) {
                challenge.attemptCount += 1;
                if (challenge.attemptCount >= 5)
                    challenge.consumedAt = now;
                await repository.save(challenge);
                return { kind: 'invalid' };
            }
            challenge.consumedAt = now;
            await repository.save(challenge);
            if (purpose === 'login') {
                const user = await this.identityService.findOrCreate(manager, 'phone', phoneNumber, 'Student');
                return { kind: 'authenticated', user };
            }
            if (!requestedForUserId)
                return { kind: 'invalid' };
            try {
                await this.identityService.link(manager, requestedForUserId, 'phone', phoneNumber);
                return { kind: 'linked' };
            }
            catch (error) {
                if (error instanceof ConflictException)
                    return { kind: 'conflict' };
                throw error;
            }
        });
    }
    codeHash(secret, verificationId, phoneNumber, code) {
        return createHmac('sha256', secret)
            .update(`${verificationId}:${phoneNumber}:${code}`)
            .digest('hex');
    }
    constantTimeEqual(leftHex, rightHex) {
        if (!/^[a-f0-9]{64}$/i.test(leftHex) || !/^[a-f0-9]{64}$/i.test(rightHex)) {
            return false;
        }
        return timingSafeEqual(Buffer.from(leftHex, 'hex'), Buffer.from(rightHex, 'hex'));
    }
};
PhoneAuthService = __decorate([
    Injectable(),
    __param(1, InjectRepository(PhoneVerification)),
    __metadata("design:paramtypes", [DataSource,
        Repository,
        IdentityService,
        SmsProvider,
        ConfigService])
], PhoneAuthService);
export { PhoneAuthService };
//# sourceMappingURL=phone-auth.service.js.map