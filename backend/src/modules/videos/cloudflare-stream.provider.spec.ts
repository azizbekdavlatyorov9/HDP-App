import { createHmac } from 'node:crypto';
import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloudflareStreamProvider } from './cloudflare-stream.provider.js';

function provider(values: Record<string, string> = {}) {
  return new CloudflareStreamProvider({
    get: (key: string) => values[key],
  } as never);
}

afterEach(() => vi.unstubAllGlobals());

describe('Cloudflare Stream API', () => {
  it('uses only staging account credentials and customer code in staging', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: {
            uid: 'staging-uid',
            uploadURL: 'https://upload.example/once',
          },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const cloudflare = provider({
      NODE_ENV: 'staging',
      STAGING_CLOUDFLARE_ACCOUNT_ID: 'staging-account',
      STAGING_CLOUDFLARE_STREAM_API_TOKEN: 'staging-token',
      STAGING_CLOUDFLARE_STREAM_CUSTOMER_CODE: 'staging-customer',
      CLOUDFLARE_ACCOUNT_ID: 'production-account',
      CLOUDFLARE_STREAM_API_TOKEN: 'production-token',
      CLOUDFLARE_STREAM_CUSTOMER_CODE: 'production-customer',
    });

    await cloudflare.createUpload(60, 'Test');
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/accounts/staging-account/');
    expect(request.headers).toMatchObject({
      Authorization: 'Bearer staging-token',
    });

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ success: true, result: { token: 'signed' } }),
      ),
    );
    const playback = await cloudflare.createPlayback('staging-uid');
    expect(playback.playbackUrl).toContain(
      'customer-staging-customer.cloudflarestream.com',
    );
  });

  it('fails closed in staging when staging credentials are absent', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const cloudflare = provider({
      NODE_ENV: 'staging',
      CLOUDFLARE_ACCOUNT_ID: 'production-account',
      CLOUDFLARE_STREAM_API_TOKEN: 'production-token',
      CLOUDFLARE_API_TOKEN: 'legacy-production-token',
      CLOUDFLARE_WEBHOOK_SECRET: 'production-webhook-secret',
    });

    await expect(cloudflare.createUpload(60, 'Test')).rejects.toThrow(
      'Video provider is not configured',
    );
    expect(() =>
      cloudflare.verifyWebhook(Buffer.from('{}'), 'invalid'),
    ).toThrow('Video webhook is not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preserves production configuration and keeps staging webhook secrets isolated', () => {
    const raw = Buffer.from('{"uid":"staging-uid"}');
    const stagingSecret = 'staging-secret';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac('sha256', stagingSecret)
      .update(`${timestamp}.${raw.toString()}`)
      .digest('hex');

    expect(
      provider({
        NODE_ENV: 'staging',
        STAGING_CLOUDFLARE_WEBHOOK_SECRET: stagingSecret,
        CLOUDFLARE_WEBHOOK_SECRET: 'production-secret',
      }).verifyWebhook(raw, `time=${timestamp},sig1=${signature}`).uid,
    ).toBe('staging-uid');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: {
            uid: 'production-uid',
            uploadURL: 'https://upload.example/once',
          },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const production = provider({
      NODE_ENV: 'production',
      CLOUDFLARE_ACCOUNT_ID: 'production-account',
      CLOUDFLARE_API_TOKEN: 'legacy-production-token',
      STAGING_CLOUDFLARE_ACCOUNT_ID: 'staging-account',
      STAGING_CLOUDFLARE_STREAM_API_TOKEN: 'staging-token',
    });

    return expect(production.createUpload(60, 'Test'))
      .resolves.toMatchObject({
        uid: 'production-uid',
      })
      .then(() => {
        const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toContain('/accounts/production-account/');
        expect(request.headers).toMatchObject({
          Authorization: 'Bearer legacy-production-token',
        });
      });
  });

  it('accepts a valid webhook signature and rejects tampering', () => {
    const secret = 'test-secret';
    const cloudflare = provider({ CLOUDFLARE_WEBHOOK_SECRET: secret });
    const raw = Buffer.from('{"uid":"abc","readyToStream":true}');
    const time = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac('sha256', secret)
      .update(`${time}.${raw.toString()}`)
      .digest('hex');
    expect(
      cloudflare.verifyWebhook(raw, `time=${time},sig1=${signature}`).uid,
    ).toBe('abc');
    expect(() => cloudflare.verifyWebhook(raw, `time=${time},sig1=00`)).toThrow(
      UnauthorizedException,
    );
  });

  it('creates private Direct Creator Upload URLs without exposing API credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: {
            uid: 'uid',
            uploadURL: 'https://upload.example/one-time',
          },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const cloudflare = provider({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_STREAM_API_TOKEN: 'secret',
    });
    await expect(cloudflare.createUpload(600, 'Algebra')).resolves.toEqual({
      uid: 'uid',
      uploadUrl: 'https://upload.example/one-time',
    });
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.headers).toMatchObject({ Authorization: 'Bearer secret' });
    expect(JSON.parse(String(request.body))).toMatchObject({
      maxDurationSeconds: 600,
      requireSignedURLs: true,
      meta: { name: 'Algebra' },
    });
  });

  it('requests a short-lived HLS token with downloads disabled', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ success: true, result: { token: 'signed' } }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const cloudflare = provider({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_STREAM_API_TOKEN: 'secret',
      CLOUDFLARE_STREAM_CUSTOMER_CODE: 'customer',
    });
    const grant = await cloudflare.createPlayback('uid');
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body)) as {
      exp: number;
      downloadable: boolean;
    };
    expect(body.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(body.exp).toBeLessThanOrEqual(
      Math.floor(Date.now() / 1000) + 15 * 60,
    );
    expect(body.downloadable).toBe(false);
    expect(grant.playbackUrl).toBe(
      'https://customer-customer.cloudflarestream.com/signed/manifest/video.m3u8',
    );
    expect(grant.playbackUrl).not.toContain('secret');
  });

  it('deletes only by the supplied Cloudflare video UID and surfaces provider failures safely', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true, result: {} })),
      );
    vi.stubGlobal('fetch', fetchMock);
    await provider({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_API_TOKEN: 'legacy-token',
    }).deleteVideo('expected-uid');
    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    expect(call![0]).toContain('/stream/expected-uid');
    expect((call![1] as RequestInit).method).toBe('DELETE');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 403 })),
    );
    await expect(
      provider({
        CLOUDFLARE_ACCOUNT_ID: 'account',
        CLOUDFLARE_STREAM_API_TOKEN: 'token',
      }).deleteVideo('expected-uid'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('fails safely when provider configuration or response is invalid', async () => {
    await expect(provider().createUpload(10, 'Title')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ success: false }))),
    );
    await expect(
      provider({
        CLOUDFLARE_ACCOUNT_ID: 'account',
        CLOUDFLARE_STREAM_API_TOKEN: 'token',
      }).createUpload(10, 'Title'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
