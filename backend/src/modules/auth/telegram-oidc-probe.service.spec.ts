import { ServiceUnavailableException } from '@nestjs/common';
import { TelegramOidcProbeService } from './telegram-oidc-probe.service.js';

describe('TelegramOidcProbeService', () => {
  const clientId = 'telegram-test-client';
  const clientSecret = 'test-secret-never-logged';
  const redirectUri = 'https://api.example.test/api/auth/telegram/oidc-probe/callback';
  let config: { get: (key: string) => unknown };
  let telegramAuth: { createLoginChallenge: () => Promise<{ nonce: string; expiresAt: Date }> };
  let verifier: { verify: (idToken: string) => Promise<{ nonce: string }> };
  let service: TelegramOidcProbeService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    config = {
      get: (key: string) =>
        ({
          TELEGRAM_OIDC_PROBE_ENABLED: true,
          NODE_ENV: 'development',
          TELEGRAM_CLIENT_ID: clientId,
          TELEGRAM_CLIENT_SECRET: clientSecret,
          TELEGRAM_OIDC_PROBE_REDIRECT_URI: redirectUri,
        })[key],
    };
    telegramAuth = {
      createLoginChallenge: vi.fn(async () => ({
        nonce: 'challenge-nonce',
        expiresAt: new Date(Date.now() + 5 * 60_000),
      })),
    };
    verifier = {
      verify: vi.fn(async () => ({ nonce: 'challenge-nonce' })),
    };
    service = new TelegramOidcProbeService(
      config as never,
      telegramAuth as never,
      verifier as never,
    );
    fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id_token: 'opaque-test-id-token' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('starts with backend challenge nonce and S256 PKCE, then returns PASS on a matching verified nonce', async () => {
    const started = await service.start();
    const authorization = new URL(started.authorizationUrl);
    const state = authorization.searchParams.get('state') ?? undefined;

    expect(service.getResult(started.probeId)).toBe('FAIL');
    expect(authorization.searchParams.get('nonce')).toBe('challenge-nonce');
    expect(authorization.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorization.searchParams.get('code_challenge')).toBeTruthy();
    await expect(service.complete('one-time-code', state)).resolves.toBe('PASS');
    expect(service.getResult(started.probeId)).toBe('PASS');
    expect(verifier.verify).toHaveBeenCalledWith('opaque-test-id-token');
    expect(telegramAuth.createLoginChallenge).toHaveBeenCalledTimes(1);
  });

  it('returns FAIL when the verified ID token nonce does not match the challenge', async () => {
    verifier.verify = vi.fn(async () => ({ nonce: 'different-nonce' }));
    const started = await service.start();
    const state = new URL(started.authorizationUrl).searchParams.get('state') ?? undefined;

    await expect(service.complete('one-time-code', state)).resolves.toBe('FAIL');
    expect(service.getResult(started.probeId)).toBe('FAIL');
  });

  it('returns FAIL for missing, unknown, or replayed state without exchanging a code', async () => {
    await expect(service.complete('one-time-code', undefined)).resolves.toBe('FAIL');
    await expect(service.complete('one-time-code', 'unknown-state')).resolves.toBe('FAIL');

    const started = await service.start();
    const state = new URL(started.authorizationUrl).searchParams.get('state') ?? undefined;
    await expect(service.complete('one-time-code', state)).resolves.toBe('PASS');
    await expect(service.complete('one-time-code', state)).resolves.toBe('FAIL');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fails closed when enabled in production', async () => {
    config.get = (key: string) =>
      key === 'TELEGRAM_OIDC_PROBE_ENABLED'
        ? true
        : key === 'NODE_ENV'
          ? 'production'
          : key === 'TELEGRAM_CLIENT_ID'
            ? clientId
            : key === 'TELEGRAM_CLIENT_SECRET'
              ? clientSecret
              : key === 'TELEGRAM_OIDC_PROBE_REDIRECT_URI'
                ? redirectUri
                : undefined;
    await expect(service.start()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(telegramAuth.createLoginChallenge).not.toHaveBeenCalled();
  });
});
