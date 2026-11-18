var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { PhoneAuthService } from './phone-auth.service.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { TelegramAuthService } from './telegram-auth.service.js';
let AuthService = class AuthService {
    telegramAuth;
    phoneAuth;
    refreshTokens;
    jwt;
    config;
    users;
    constructor(telegramAuth, phoneAuth, refreshTokens, jwt, config, users) {
        this.telegramAuth = telegramAuth;
        this.phoneAuth = phoneAuth;
        this.refreshTokens = refreshTokens;
        this.jwt = jwt;
        this.config = config;
        this.users = users;
    }
    async loginWithTelegram(idToken, metadata) {
        const user = await this.telegramAuth.authenticate(idToken);
        return this.createSession(user, metadata);
    }
    async loginWithPhone(phoneNumber, code, metadata) {
        const user = await this.phoneAuth.verifyLoginCode(phoneNumber, code);
        return this.createSession(user, metadata);
    }
    async refresh(refreshToken, metadata) {
        const rotated = await this.refreshTokens.rotate(refreshToken, metadata);
        return this.toSession(rotated.user, rotated.refreshToken);
    }
    async logout(userId, refreshToken) {
        await this.refreshTokens.revoke(userId, refreshToken);
    }
    async getMe(user) {
        const profile = await this.users.getProfile(user.id);
        return {
            id: profile.id,
            name: profile.displayName,
            email: null,
            roles: profile.roles,
        };
    }
    async createSession(user, metadata) {
        const refreshToken = await this.refreshTokens.create(user, metadata);
        return this.toSession(user, refreshToken);
    }
    async toSession(user, refreshToken) {
        const secret = this.config.get('JWT_ACCESS_SECRET');
        if (!secret) {
            throw new ServiceUnavailableException('Authentication is temporarily unavailable.');
        }
        const accessToken = await this.jwt.signAsync({ tokenUse: 'access' }, {
            secret,
            subject: user.id,
            issuer: 'education-center-api',
            audience: 'education-center-mobile',
            expiresIn: '15m',
        });
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 900,
            user: await this.users.getProfile(user.id),
        };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [TelegramAuthService,
        PhoneAuthService,
        RefreshTokenService,
        JwtService,
        ConfigService,
        UsersService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map