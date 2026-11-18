var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable, ServiceUnavailableException, UnauthorizedException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export const STREAM_PROVIDER = Symbol('STREAM_PROVIDER');
let CloudflareStreamProvider = class CloudflareStreamProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    staging() {
        return this.config.get('NODE_ENV') === 'staging';
    }
    setting(name, stagingName) {
        return this.config.get(this.staging() ? stagingName : name);
    }
    credentials() {
        const account = this.setting('CLOUDFLARE_ACCOUNT_ID', 'STAGING_CLOUDFLARE_ACCOUNT_ID');
        const token = this.setting('CLOUDFLARE_STREAM_API_TOKEN', 'STAGING_CLOUDFLARE_STREAM_API_TOKEN') ??
            (!this.staging()
                ? this.config.get('CLOUDFLARE_API_TOKEN')
                : undefined);
        if (!account || !token)
            throw new ServiceUnavailableException('Video provider is not configured');
        return { account, token };
    }
    async request(url, token, method, body) {
        let response;
        try {
            response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                ...(body === undefined ? {} : { body: JSON.stringify(body) }),
            });
        }
        catch {
            throw new ServiceUnavailableException('Video provider unavailable');
        }
        let result;
        try {
            result = (await response.json());
        }
        catch {
        }
        if (!response.ok || !result?.success)
            throw new ServiceUnavailableException('Video provider request failed');
        return result.result ?? {};
    }
    async createUpload(maxDurationSeconds, title) {
        const { account, token } = this.credentials();
        const r = await this.request(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/stream/direct_upload`, token, 'POST', { maxDurationSeconds, requireSignedURLs: true, meta: { name: title } });
        if (typeof r.uid !== 'string' || typeof r.uploadURL !== 'string')
            throw new ServiceUnavailableException('Video provider returned invalid upload response');
        return { uid: r.uid, uploadUrl: r.uploadURL };
    }
    async createPlayback(uid) {
        const { account, token } = this.credentials();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const r = await this.request(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/stream/${encodeURIComponent(uid)}/token`, token, 'POST', { exp: Math.floor(expiresAt.getTime() / 1000), downloadable: false });
        if (typeof r.token !== 'string')
            throw new ServiceUnavailableException('Video provider returned invalid playback response');
        const customer = this.setting('CLOUDFLARE_STREAM_CUSTOMER_CODE', 'STAGING_CLOUDFLARE_STREAM_CUSTOMER_CODE');
        const host = customer
            ? `https://customer-${encodeURIComponent(customer)}.cloudflarestream.com`
            : 'https://videodelivery.net';
        return {
            token: r.token,
            playbackUrl: `${host}/${encodeURIComponent(r.token)}/manifest/video.m3u8`,
            expiresAt,
        };
    }
    async deleteVideo(uid) {
        const { account, token } = this.credentials();
        await this.request(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/stream/${encodeURIComponent(uid)}`, token, 'DELETE');
    }
    verifyWebhook(raw, signature) {
        const secret = this.setting('CLOUDFLARE_WEBHOOK_SECRET', 'STAGING_CLOUDFLARE_WEBHOOK_SECRET');
        if (!secret)
            throw new ServiceUnavailableException('Video webhook is not configured');
        const match = signature?.match(/(?:^|,)time=(\d+),sig1=([a-f0-9]+)/);
        if (!match)
            throw new UnauthorizedException('Invalid webhook signature');
        const ts = Number(match[1]);
        if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300)
            throw new UnauthorizedException('Expired webhook signature');
        const expected = createHmac('sha256', secret)
            .update(`${match[1]}.${raw.toString('utf8')}`)
            .digest();
        const supplied = Buffer.from(match[2], 'hex');
        if (supplied.length !== expected.length ||
            !timingSafeEqual(supplied, expected))
            throw new UnauthorizedException('Invalid webhook signature');
        try {
            return JSON.parse(raw.toString('utf8'));
        }
        catch {
            throw new UnauthorizedException('Invalid webhook payload');
        }
    }
};
CloudflareStreamProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], CloudflareStreamProvider);
export { CloudflareStreamProvider };
//# sourceMappingURL=cloudflare-stream.provider.js.map