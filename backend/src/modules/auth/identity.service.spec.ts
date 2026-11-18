import { describe, expect, it, vi } from 'vitest';
import { AuthIdentity, Role, User, UserRole } from '../../database/entities/core.entity.js';
import { MemoryRepository } from '../../../test/auth-test-helpers.js';
import { IdentityService } from './identity.service.js';

function managerFixture() {
  const users = new MemoryRepository<User>();
  const identities = new MemoryRepository<AuthIdentity>();
  const roles = new MemoryRepository<Role>();
  const userRoles = new MemoryRepository<UserRole>();
  roles.items.push({ id: 'student-role', code: 'STUDENT' } as Role);
  const query = vi.fn(async () => undefined);
  const repositories = new Map<Function, unknown>([
    [User, users],
    [AuthIdentity, identities],
    [Role, roles],
    [UserRole, userRoles],
  ]);
  const manager = {
    query,
    getRepository: (entity: Function) => repositories.get(entity),
  };
  return { manager, query, users, identities, roles, userRoles };
}

describe('IdentityService Telegram identity handling', () => {
  it('creates a student and a unique Telegram identity from verified subject data', async () => {
    const f = managerFixture();
    const user = await new IdentityService().findOrCreate(
      f.manager as never,
      'telegram',
      'telegram-subject',
      'Verified Name',
    );
    expect(user.displayName).toBe('Verified Name');
    expect(user.status).toBe('active');
    expect(f.userRoles.items).toHaveLength(1);
    expect(f.userRoles.items[0]?.role.code).toBe('STUDENT');
    expect(f.identities.items).toHaveLength(1);
    expect(f.identities.items[0]).toMatchObject({ provider: 'telegram', providerSubject: 'telegram-subject' });
    expect(f.query).toHaveBeenCalledWith(
      'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
      ['auth-identity:telegram', 'telegram-subject'],
    );
  });

  it('returns an existing active identity without creating another user or identity', async () => {
    const f = managerFixture();
    const user = { id: 'existing-user', displayName: 'Known', status: 'active', deletedAt: null } as User;
    f.identities.items.push({
      id: 'existing-identity',
      provider: 'telegram',
      providerSubject: 'telegram-subject',
      user,
    } as AuthIdentity);
    await expect(new IdentityService().findOrCreate(f.manager as never, 'telegram', 'telegram-subject', 'Ignored Name')).resolves.toBe(user);
    expect(f.users.items).toHaveLength(0);
    expect(f.identities.items).toHaveLength(1);
  });

  it('links Telegram to the current active user without trusting phone or email', async () => {
    const f = managerFixture();
    f.users.items.push({ id: 'user-id', status: 'active', deletedAt: null } as User);
    await new IdentityService().link(f.manager as never, 'user-id', 'telegram', 'telegram-subject');
    expect(f.identities.items).toHaveLength(1);
    expect(f.identities.items[0]).toMatchObject({
      provider: 'telegram',
      providerSubject: 'telegram-subject',
      user: { id: 'user-id' },
      metadata: null,
    });
  });
});
