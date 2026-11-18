var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ServiceUnavailableException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { TelegramAuthService } from './telegram-auth.service.js';
import { TelegramIdTokenVerifier } from './telegram-id-token-verifier.js';
const TELEGRAM_AUTHORIZATION_ENDPOINT = 'https://oauth.telegram.org/auth';
const TELEGRAM_TOKEN_ENDPOINT = 'https://oauth.telegram.org/token';
const TRANSACTION_TTL_MS = 5 * 60_000;
const MAX_PENDING_TRANSACTIONS = 500;
let TelegramOidcProbeService = class TelegramOidcProbeService {
    config;
    telegramAuth;
    verifier;
    transactions = new Map();
    outcomes = new Map();
    constructor(config, telegramAuth, verifier) {
        this.config = config;
        this.telegramAuth = telegramAuth;
        this.verifier = verifier;
    }
    async start() {
        const settings = this.requireSettings();
        this.removeExpiredTransactions();
        if (this.transactions.size >= MAX_PENDING_TRANSACTIONS) {
            throw new ServiceUnavailableException('Telegram OIDC probe is busy.');
        }
        const challenge = await this.telegramAuth.createLoginChallenge();
        const state = randomBytes(32).toString('base64url');
        const probeId = randomBytes(32).toString('base64url');
        const codeVerifier = randomBytes(32).toString('base64url');
        const codeChallenge = createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');
        const expiresAt = Math.min(challenge.expiresAt.getTime(), Date.now() + TRANSACTION_TTL_MS);
        this.transactions.set(state, {
            probeId,
            nonce: challenge.nonce,
            codeVerifier,
            expiresAt,
        });
        const authorizationUrl = new URL(TELEGRAM_AUTHORIZATION_ENDPOINT);
        authorizationUrl.searchParams.set('client_id', settings.clientId);
        authorizationUrl.searchParams.set('redirect_uri', settings.redirectUri);
        authorizationUrl.searchParams.set('response_type', 'code');
        authorizationUrl.searchParams.set('scope', 'openid profile');
        authorizationUrl.searchParams.set('state', state);
        authorizationUrl.searchParams.set('nonce', challenge.nonce);
        authorizationUrl.searchParams.set('code_challenge', codeChallenge);
        authorizationUrl.searchParams.set('code_challenge_method', 'S256');
        return { authorizationUrl: authorizationUrl.toString(), probeId };
    }
    getResult(probeId) {
        if (!probeId || probeId.length > 256)
            return 'FAIL';
        const outcome = this.outcomes.get(probeId);
        if (!outcome || outcome.expiresAt <= Date.now()) {
            this.outcomes.delete(probeId);
            return 'FAIL';
        }
        return outcome.result;
    }
    async complete(code, state) {
        if (!state || state.length > 256)
            return 'FAIL';
        const transaction = this.transactions.get(state);
        this.transactions.delete(state);
        if (!transaction || transaction.expiresAt <= Date.now())
            return 'FAIL';
        let result = 'FAIL';
        try {
            if (!code || code.length > 4096)
                throw new Error('Invalid authorization response.');
            const settings = this.requireSettings();
            const body = new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: settings.redirectUri,
                client_id: settings.clientId,
                code_verifier: transaction.codeVerifier,
            });
            const basicCredentials = Buffer.from(`${settings.clientId}:${settings.clientSecret}`).toString('base64');
            const tokenResponse = await fetch(TELEGRAM_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${basicCredentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                body,
                signal: AbortSignal.timeout(10_000),
            });
            if (!tokenResponse.ok)
                throw new Error('Token exchange failed.');
            const payload = await tokenResponse.json();
            if (!this.isTokenResponse(payload))
                throw new Error('ID token missing.');
            const verified = await this.verifier.verify(payload.id_token);
            result = verified.nonce === transaction.nonce ? 'PASS' : 'FAIL';
        }
        catch {
            result = 'FAIL';
        }
        this.outcomes.set(transaction.probeId, {
            result,
            expiresAt: Date.now() + TRANSACTION_TTL_MS,
        });
        return result;
    }
    requireSettings() {
        const enabled = this.config.get('TELEGRAM_OIDC_PROBE_ENABLED');
        const nodeEnv = this.config.get('NODE_ENV') ?? 'development';
        const clientId = this.config.get('TELEGRAM_CLIENT_ID')?.trim();
        const clientSecret = this.config.get('TELEGRAM_CLIENT_SECRET');
        const redirectUri = this.config.get('TELEGRAM_OIDC_PROBE_REDIRECT_URI')?.trim();
        let validRedirectUri = false;
        try {
            const parsed = new URL(redirectUri ?? '');
            validRedirectUri =
                parsed.protocol === 'https:' &&
                    parsed.pathname.endsWith('/api/auth/telegram/oidc-probe/callback') &&
                    !parsed.search &&
                    !parsed.hash;
        }
        catch {
            validRedirectUri = false;
        }
        if ((enabled !== true && enabled !== 'true') ||
            nodeEnv === 'production' ||
            !clientId ||
            !clientSecret ||
            !validRedirectUri) {
            throw new ServiceUnavailableException('Telegram OIDC probe is unavailable.');
        }
        return { clientId, clientSecret, redirectUri: redirectUri };
    }
    isTokenResponse(value) {
        if (typeof value !== 'object' || value === null || Array.isArray(value))
            return false;
        const idToken = value.id_token;
        return typeof idToken === 'string' && idToken.length > 0;
    }
    removeExpiredTransactions() {
        const now = Date.now();
        for (const [state, transaction] of this.transactions) {
            if (transaction.expiresAt <= now)
                this.transactions.delete(state);
        }
        for (const [probeId, outcome] of this.outcomes) {
            if (outcome.expiresAt <= now)
                this.outcomes.delete(probeId);
        }
    }
};
TelegramOidcProbeService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        TelegramAuthService,
        TelegramIdTokenVerifier])
], TelegramOidcProbeService);
export { TelegramOidcProbeService };
//# sourceMappingURL=telegram-oidc-probe.service.js.map