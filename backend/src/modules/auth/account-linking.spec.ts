import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  AuthChallenge,
  AuthIdentity,
  User,
} from '../../database/entities/core.entity.js';
import {
  MemoryDataSource,
  MemoryRepository,
} from '../../../test/auth-test-helpers.js';
import { IdentityService } from './identity.service.js';
import { TelegramAuthService } from './telegram-auth.service.js';

describe('account linking security', () => {
  it('rejects a Telegram challenge issued for a different account', async () => {
    const challengeRepo = new MemoryRepository<AuthChallenge>();
    const nonce = 'fresh-oidc-nonce';
    challengeRepo.items.push({
      id: 'challenge-1',
      nonceHash: createHash('sha256').update(nonce).digest('hex'),
      provider: 'telegram',
      purpose: 'link',
      requestedForUser: { id: 'account-b' } as User,
      requestedForUserId: 'account-b',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      createdAt: new Date(),
    } as AuthChallenge);
    const dataSource = new MemoryDataSource(
      new Map([[AuthChallenge, challengeRepo]]),
    );
    const identityService = { link: vi.fn() };
    const verifier = {
      verify: vi.fn(async () => ({
        subject: 'telegram-user',
        nonce,
        issuedAt: Math.floor(Date.now() / 1000),
        displayName: null,
      })),
    };
    const service = new TelegramAuthService(
      dataSource as never,
      challengeRepo as never,
      identityService as unknown as IdentityService,
      verifier as never,
    );

    await expect(
      service.link('account-a', 'signed-id-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(identityService.link).not.toHaveBeenCalled();
    expect(challengeRepo.items[0].consumedAt).toBeNull();
  });

  it('prevents linking a provider identity already owned by another user', async () => {
    const users = new MemoryRepository<User>();
    users.items.push({
      id: 'account-a',
      status: 'active',
      deletedAt: null,
    } as User);
    const identities = new MemoryRepository<AuthIdentity>();
    identities.items.push({
      id: 'identity-1',
      provider: 'telegram',
      providerSubject: 'telegram-user',
      user: { id: 'account-b' } as User,
    } as AuthIdentity);
    const manager = {
      query: vi.fn(async () => undefined),
      getRepository: (entity: Function) =>
        new Map<Function, unknown>([
          [User, users],
          [AuthIdentity, identities],
        ]).get(entity),
    };

    await expect(
      new IdentityService().link(
        manager as never,
        'account-a',
        'telegram',
        'telegram-user',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(identities.items).toHaveLength(1);
  });
});
