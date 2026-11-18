import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';

describe('AuthService.getMe', () => {
  it('returns only the safe profile fields and does not expose extra profile data', async () => {
    const users = {
      getProfile: vi.fn().mockResolvedValue({
        id: 'user-id',
        displayName: 'Mathematics Student',
        status: 'active',
        roles: ['STUDENT'],
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'must-not-leak',
        internalSecret: 'must-not-leak',
      }),
    };
    const service = new AuthService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      users as never,
    );

    const result = await service.getMe({
      id: 'user-id',
      displayName: 'JWT display name',
      roles: ['STUDENT'],
    });

    expect(users.getProfile).toHaveBeenCalledWith('user-id');
    expect(result).toEqual({
      id: 'user-id',
      name: 'Mathematics Student',
      email: null,
      roles: ['STUDENT'],
    });
    expect(JSON.stringify(result)).not.toContain('must-not-leak');
  });
});

describe('AuthService Telegram session lifecycle', () => {
  it('issues an access token and refresh token after Telegram authentication succeeds', async () => {
    const user = { id: 'telegram-user', status: 'active' } as never;
    const telegram = { authenticate: vi.fn().mockResolvedValue(user) };
    const refreshTokens = { create: vi.fn().mockResolvedValue('opaque-refresh-token') };
    const jwt = { signAsync: vi.fn().mockResolvedValue('signed-access-token') };
    const users = {
      getProfile: vi.fn().mockResolvedValue({
        id: 'telegram-user',
        displayName: 'Verified Telegram User',
        roles: ['STUDENT'],
      }),
    };
    const service = new AuthService(
      telegram as never,
      {} as never,
      refreshTokens as never,
      jwt as never,
      { get: () => 'test-only-secret-value-that-is-not-a-real-secret' } as never,
      users as never,
    );

    const session = await service.loginWithTelegram('verified-id-token', {
      ipAddress: '127.0.0.1',
      userAgent: 'unit-test',
    });
    expect(telegram.authenticate).toHaveBeenCalledWith('verified-id-token');
    expect(refreshTokens.create).toHaveBeenCalledWith(user, {
      ipAddress: '127.0.0.1',
      userAgent: 'unit-test',
    });
    expect(jwt.signAsync).toHaveBeenCalledOnce();
    expect(session).toMatchObject({
      accessToken: 'signed-access-token',
      refreshToken: 'opaque-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: { id: 'telegram-user', roles: ['STUDENT'] },
    });
  });

  it('keeps logout routed through refresh-token revocation', async () => {
    const refreshTokens = { revoke: vi.fn().mockResolvedValue(undefined) };
    const service = new AuthService(
      {} as never,
      {} as never,
      refreshTokens as never,
      {} as never,
      {} as never,
      {} as never,
    );
    await service.logout('telegram-user', 'opaque-refresh-token');
    expect(refreshTokens.revoke).toHaveBeenCalledWith('telegram-user', 'opaque-refresh-token');
  });
});
