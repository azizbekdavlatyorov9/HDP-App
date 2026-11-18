import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { AuthChallenge, User } from '../../database/entities/core.entity.js';
import { MemoryDataSource, MemoryRepository } from '../../../test/auth-test-helpers.js';
import { TelegramAuthService } from './telegram-auth.service.js';

const nonce = 'one-time-telegram-nonce';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

function setup(purpose: 'login' | 'link' = 'login', userId?: string) {
  const challenges = new MemoryRepository<AuthChallenge>();
  const challenge = {
    id: 'challenge-id',
    provider: 'telegram',
    purpose,
    requestedForUser: userId ? ({ id: userId } as User) : null,
    requestedForUserId: userId ?? null,
    nonceHash: hash(nonce),
    expiresAt: new Date(Date.now() + 60_000),
    consumedAt: null,
  } as AuthChallenge;
  challenges.items.push(challenge);
  const identityService = {
    findOrCreate: vi.fn(async () => ({ id: 'user-id', status: 'active' }) as User),
    link: vi.fn(async () => undefined),
  };
  const verifier = {
    verify: vi.fn(async () => ({
      subject: 'telegram-subject-123',
      nonce,
      issuedAt: Math.floor(Date.now() / 1000),
      displayName: 'Verified Telegram Name',
    })),
  };
  const dataSource = new MemoryDataSource(new Map([[AuthChallenge, challenges]]));
  return {
    service: new TelegramAuthService(dataSource as never, challenges as never, identityService as never, verifier as never),
    challenges,
    challenge,
    identityService,
    verifier,
  };
}

describe('TelegramAuthService', () => {
  it('creates a short-lived challenge and stores only its hash', async () => {
    const f = setup();
    const result = await f.service.createLoginChallenge();
    expect(result.nonce).toBeTruthy();
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(f.challenges.items[1]?.nonceHash).toBe(hash(result.nonce));
    expect(f.challenges.items[1]?.nonceHash).not.toBe(result.nonce);
    expect(f.challenges.items[1]).toMatchObject({ provider: 'telegram', purpose: 'login', consumedAt: null });
  });

  it('authenticates a verified Telegram identity through IdentityService', async () => {
    const f = setup();
    const user = { id: 'user-id', status: 'active' } as User;
    f.identityService.findOrCreate.mockResolvedValue(user);
    await expect(f.service.authenticate('signed-id-token')).resolves.toBe(user);
    expect(f.verifier.verify).toHaveBeenCalledWith('signed-id-token');
    expect(f.identityService.findOrCreate).toHaveBeenCalledWith(
      expect.anything(),
      'telegram',
      'telegram-subject-123',
      'Verified Telegram Name',
    );
    expect(f.challenge.consumedAt).toBeInstanceOf(Date);
  });

  it('rejects challenge replay and does not authenticate a second time', async () => {
    const f = setup();
    await f.service.authenticate('signed-id-token');
    await expect(f.service.authenticate('signed-id-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(f.identityService.findOrCreate).toHaveBeenCalledOnce();
  });

  it.each([
    { purpose: 'link' as const, userId: undefined, consumed: false, expired: false },
    { purpose: 'login' as const, userId: undefined, consumed: true, expired: false },
    { purpose: 'login' as const, userId: undefined, consumed: false, expired: true },
  ])('rejects an invalid login challenge state', async ({ purpose, userId, consumed, expired }) => {
    const f = setup(purpose, userId);
    if (consumed) f.challenge.consumedAt = new Date();
    if (expired) f.challenge.expiresAt = new Date(Date.now() - 1);
    await expect(f.service.authenticate('signed-id-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(f.identityService.findOrCreate).not.toHaveBeenCalled();
  });

  it('links only the authenticated account bound to the one-time link challenge', async () => {
    const f = setup('link', 'account-id');
    await expect(f.service.link('account-id', 'signed-id-token')).resolves.toBeUndefined();
    expect(f.identityService.link).toHaveBeenCalledWith(
      expect.anything(),
      'account-id',
      'telegram',
      'telegram-subject-123',
    );
    expect(f.challenge.consumedAt).toBeInstanceOf(Date);
  });

  it('rejects expired or differently scoped link challenges without linking', async () => {
    const f = setup('link', 'other-account');
    await expect(f.service.link('account-id', 'signed-id-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(f.identityService.link).not.toHaveBeenCalled();
  });
});
