import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  it('resolves the current active user from the JWT subject', async () => {
    const authenticatedUser = {
      id: 'user-id',
      displayName: 'Student',
      roles: ['STUDENT'],
    };
    const users = {
      getAuthenticatedUser: vi.fn().mockResolvedValue(authenticatedUser),
    };
    const strategy = new JwtStrategy(
      { getOrThrow: () => 'unit-test-secret' } as never,
      users as never,
    );

    await expect(
      strategy.validate({ sub: 'user-id', tokenUse: 'access' }),
    ).resolves.toBe(authenticatedUser);
    expect(users.getAuthenticatedUser).toHaveBeenCalledWith('user-id');
    expect(
      (strategy as unknown as { _verifOpts: { ignoreExpiration: boolean } })
        ._verifOpts.ignoreExpiration,
    ).toBe(false);
  });

  it('rejects refresh tokens and malformed access token subjects', async () => {
    const users = { getAuthenticatedUser: vi.fn() };
    const strategy = new JwtStrategy(
      { getOrThrow: () => 'unit-test-secret' } as never,
      users as never,
    );

    await expect(
      strategy.validate({ sub: 'user-id', tokenUse: 'refresh' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      strategy.validate({ sub: undefined, tokenUse: 'access' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.getAuthenticatedUser).not.toHaveBeenCalled();
  });

  it('propagates an unauthorized result when the token subject is not active', async () => {
    const users = {
      getAuthenticatedUser: vi
        .fn()
        .mockRejectedValue(new UnauthorizedException()),
    };
    const strategy = new JwtStrategy(
      { getOrThrow: () => 'unit-test-secret' } as never,
      users as never,
    );

    await expect(
      strategy.validate({ sub: 'inactive-user', tokenUse: 'access' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
