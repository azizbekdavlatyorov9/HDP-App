import { UnauthorizedException } from '@nestjs/common';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import {
  TelegramIdTokenVerifier,
  TELEGRAM_ISSUER,
} from './telegram-id-token-verifier.js';

describe('TelegramIdTokenVerifier', () => {
  let verifier: TelegramIdTokenVerifier;
  let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
  let wrongPrivateKey: Awaited<
    ReturnType<typeof generateKeyPair>
  >['privateKey'];

  beforeAll(async () => {
    const pair = await generateKeyPair('RS256');
    const wrongPair = await generateKeyPair('RS256');
    privateKey = pair.privateKey;
    wrongPrivateKey = wrongPair.privateKey;
    const publicJwk = await exportJWK(pair.publicKey);
    const resolver = createLocalJWKSet({
      keys: [{ ...publicJwk, kid: 'test-key', alg: 'RS256', use: 'sig' }],
    });
    verifier = new TelegramIdTokenVerifier(
      { get: () => 'telegram-test-client' } as never,
      resolver,
    );
  });

  it('rejects a token with an invalid signature', async () => {
    const token = await createToken({ key: wrongPrivateKey });
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token with the wrong issuer', async () => {
    const token = await createToken({ issuer: 'https://attacker.invalid' });
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token with the wrong audience', async () => {
    const token = await createToken({ audience: 'different-client' });
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects expired tokens', async () => {
    const token = await createToken({
      expiresAt: Math.floor(Date.now() / 1000) - 1,
    });
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('requires the OIDC nonce claim', async () => {
    const token = await createToken({ nonce: null });
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  async function createToken(
    options: {
      key?: typeof privateKey;
      issuer?: string;
      audience?: string;
      expiresAt?: number;
      nonce?: string | null;
    } = {},
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const claims: Record<string, unknown> = {};
    if (options.nonce !== null) claims.nonce = options.nonce ?? 'oidc-nonce';
    return new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuer(options.issuer ?? TELEGRAM_ISSUER)
      .setAudience(options.audience ?? 'telegram-test-client')
      .setSubject('telegram-subject')
      .setIssuedAt(now)
      .setExpirationTime(options.expiresAt ?? now + 60)
      .sign(options.key ?? privateKey);
  }
});
