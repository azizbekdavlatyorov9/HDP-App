import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadGrant {
  uid: string;
  uploadUrl: string;
}
export interface PlaybackGrant {
  playbackUrl: string;
  token: string;
  expiresAt: Date;
}
export interface StreamProvider {
  createUpload(maxDurationSeconds: number, title: string): Promise<UploadGrant>;
  createPlayback(uid: string): Promise<PlaybackGrant>;
  deleteVideo(uid: string): Promise<void>;
  verifyWebhook(
    raw: Buffer,
    signature: string | undefined,
  ): Record<string, unknown>;
}
export const STREAM_PROVIDER = Symbol('STREAM_PROVIDER');

@Injectable()
export class CloudflareStreamProvider implements StreamProvider {
  constructor(private readonly config: ConfigService) {}

  private staging(): boolean {
    return this.config.get<string>('NODE_ENV') === 'staging';
  }

  private setting(name: string, stagingName: string): string | undefined {
    return this.config.get<string>(this.staging() ? stagingName : name);
  }

  private credentials() {
    const account = this.setting(
      'CLOUDFLARE_ACCOUNT_ID',
      'STAGING_CLOUDFLARE_ACCOUNT_ID',
    );
    const token =
      this.setting(
        'CLOUDFLARE_STREAM_API_TOKEN',
        'STAGING_CLOUDFLARE_STREAM_API_TOKEN',
      ) ??
      (!this.staging()
        ? this.config.get<string>('CLOUDFLARE_API_TOKEN')
        : undefined);
    if (!account || !token)
      throw new ServiceUnavailableException('Video provider is not configured');
    return { account, token };
  }
  private async request(
    url: string,
    token: string,
    method: 'POST' | 'DELETE',
    body?: unknown,
  ) {
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      throw new ServiceUnavailableException('Video provider unavailable');
    }
    let result:
      { success?: boolean; result?: Record<string, unknown> } | undefined;
    try {
      result = (await response.json()) as {
        success?: boolean;
        result?: Record<string, unknown>;
      };
    } catch {
      /* invalid/empty provider response */
    }
    if (!response.ok || !result?.success)
      throw new ServiceUnavailableException('Video provider request failed');
    return result.result ?? {};
  }
  async createUpload(maxDurationSeconds: number, title: string) {
    const { account, token } = this.credentials();
    const r = await this.request(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/stream/direct_upload`,
      token,
      'POST',
      { maxDurationSeconds, requireSignedURLs: true, meta: { name: title } },
    );
    if (typeof r.uid !== 'string' || typeof r.uploadURL !== 'string')
      throw new ServiceUnavailableException(
        'Video provider returned invalid upload response',
      );
    return { uid: r.uid, uploadUrl: r.uploadURL };
  }
  async createPlayback(uid: string) {
    const { account, token } = this.credentials();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const r = await this.request(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/stream/${encodeURIComponent(uid)}/token`,
      token,
      'POST',
      { exp: Math.floor(expiresAt.getTime() / 1000), downloadable: false },
    );
    if (typeof r.token !== 'string')
      throw new ServiceUnavailableException(
        'Video provider returned invalid playback response',
      );
    const customer = this.setting(
      'CLOUDFLARE_STREAM_CUSTOMER_CODE',
      'STAGING_CLOUDFLARE_STREAM_CUSTOMER_CODE',
    );
    const host = customer
      ? `https://customer-${encodeURIComponent(customer)}.cloudflarestream.com`
      : 'https://videodelivery.net';
    return {
      token: r.token,
      playbackUrl: `${host}/${encodeURIComponent(r.token)}/manifest/video.m3u8`,
      expiresAt,
    };
  }
  async deleteVideo(uid: string) {
    const { account, token } = this.credentials();
    await this.request(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/stream/${encodeURIComponent(uid)}`,
      token,
      'DELETE',
    );
  }
  verifyWebhook(
    raw: Buffer,
    signature: string | undefined,
  ): Record<string, unknown> {
    const secret = this.setting(
      'CLOUDFLARE_WEBHOOK_SECRET',
      'STAGING_CLOUDFLARE_WEBHOOK_SECRET',
    );
    if (!secret)
      throw new ServiceUnavailableException('Video webhook is not configured');
    const match = signature?.match(/(?:^|,)time=(\d+),sig1=([a-f0-9]+)/);
    if (!match) throw new UnauthorizedException('Invalid webhook signature');
    const ts = Number(match[1]);
    if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300)
      throw new UnauthorizedException('Expired webhook signature');
    const expected = createHmac('sha256', secret)
      .update(`${match[1]}.${raw.toString('utf8')}`)
      .digest();
    const supplied = Buffer.from(match[2], 'hex');
    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    )
      throw new UnauthorizedException('Invalid webhook signature');
    try {
      return JSON.parse(raw.toString('utf8')) as Record<string, unknown>;
    } catch {
      throw new UnauthorizedException('Invalid webhook payload');
    }
  }
}
