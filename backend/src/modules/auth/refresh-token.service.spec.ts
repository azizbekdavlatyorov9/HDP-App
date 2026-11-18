import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RefreshToken, User } from '../../database/entities/core.entity.js';
import {
  MemoryDataSource,
  MemoryRepository,
} from '../../../test/auth-test-helpers.js';
import { RefreshTokenService } from './refresh-token.service.js';

describe('RefreshTokenService', () => {
  function setup() {
    const tokens = new MemoryRepository<RefreshToken>();
    const dataSource = new MemoryDataSource(new Map([[RefreshToken, tokens]]));
    const service = new RefreshTokenService(
      dataSource as never,
      tokens as never,
    );
    const user = {
      id: 'user-1',
      status: 'active',
      deletedAt: null,
    } as User;
    return { tokens, service, user };
  }

  it('stores only a hash and rotates a refresh token', async () => {
    const { tokens, service, user } = setup();
    const rawToken = await service.create(user, {});
    const stored = tokens.items[0];
    const expectedHash = createHash('sha256').update(rawToken).digest('hex');

    expect(stored.tokenHash).toBe(expectedHash);
    expect(JSON.stringify(stored)).not.toContain(rawToken);

    const rotated = await service.rotate(rawToken, {});
    expect(rotated.refreshToken).not.toBe(rawToken);
    expect(stored.revokedAt).toBeInstanceOf(Date);
    expect(stored.replacedBy?.tokenHash).toBe(
      createHash('sha256').update(rotated.refreshToken).digest('hex'),
    );
    expect(tokens.items).toHaveLength(2);
  });

  it('detects reuse of a rotated token and revokes remaining sessions', async () => {
    const { tokens, service, user } = setup();
    const rawToken = await service.create(user, {});
    const rotated = await service.rotate(rawToken, {});
    const activeSuccessor = tokens.items.find(
      (token) =>
        token.tokenHash !== createHash('sha256').update(rawToken).digest('hex'),
    );

    await expect(service.rotate(rawToken, {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(activeSuccessor?.revokedAt).toBeInstanceOf(Date);
    await expect(
      service.rotate(rotated.refreshToken, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('revokes only the requested user token when logout supplies a refresh token', async () => {
    const { tokens, service, user } = setup();
    const rawToken = await service.create(user, {});
    await service.revoke(user.id, rawToken);
    expect(tokens.items[0]?.revokedAt).toBeInstanceOf(Date);
    expect(tokens.items[0]?.tokenHash).not.toBe(rawToken);
  });
});
