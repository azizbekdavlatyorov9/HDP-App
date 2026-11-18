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
import { Inject, Injectable, ServiceUnavailableException, UnauthorizedException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify } from 'jose';
export const TELEGRAM_JWKS_RESOLVER = Symbol('TELEGRAM_JWKS_RESOLVER');
export const TELEGRAM_ISSUER = 'https://oauth.telegram.org';
let TelegramIdTokenVerifier = class TelegramIdTokenVerifier {
    config;
    jwksResolver;
    constructor(config, jwksResolver) {
        this.config = config;
        this.jwksResolver = jwksResolver;
    }
    async verify(idToken) {
        const clientId = this.config.get('TELEGRAM_CLIENT_ID');
        if (!clientId) {
            throw new ServiceUnavailableException('Telegram authentication is not configured.');
        }
        try {
            const { payload } = await jwtVerify(idToken, this.jwksResolver, {
                issuer: TELEGRAM_ISSUER,
                audience: clientId,
                algorithms: ['RS256'],
                requiredClaims: ['sub', 'iat', 'exp', 'iss', 'aud', 'nonce'],
                maxTokenAge: '5m',
            });
            if (typeof payload.sub !== 'string' ||
                payload.sub.length === 0 ||
                typeof payload.nonce !== 'string' ||
                typeof payload.iat !== 'number') {
                throw new Error('Required OIDC claims are missing.');
            }
            const name = payload.name;
            return {
                subject: payload.sub,
                nonce: payload.nonce,
                issuedAt: payload.iat,
                displayName: typeof name === 'string' && name.trim()
                    ? name.trim().slice(0, 100)
                    : null,
            };
        }
        catch {
            throw new UnauthorizedException('Invalid Telegram identity token.');
        }
    }
};
TelegramIdTokenVerifier = __decorate([
    Injectable(),
    __param(1, Inject(TELEGRAM_JWKS_RESOLVER)),
    __metadata("design:paramtypes", [ConfigService, Function])
], TelegramIdTokenVerifier);
export { TelegramIdTokenVerifier };
//# sourceMappingURL=telegram-id-token-verifier.js.map