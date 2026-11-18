import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  AuthIdentity,
  Role,
  User,
  UserRole,
} from '../../database/entities/core.entity.js';

export type IdentityProvider = 'telegram' | 'phone';

@Injectable()
export class IdentityService {
  async createUnlinkedStudent(manager: EntityManager, displayName: string): Promise<User> {
    const user = await manager.getRepository(User).save(manager.getRepository(User).create({
      displayName: displayName.trim().slice(0, 100) || 'Student', status: 'active', deletedAt: null,
    }));
    const studentRole = await manager.getRepository(Role).findOneBy({ code: 'STUDENT' });
    if (!studentRole) throw new InternalServerErrorException('Default student role is not available.');
    await manager.getRepository(UserRole).save(manager.getRepository(UserRole).create({ user, role: studentRole }));
    return user;
  }

  async findOrCreate(
    manager: EntityManager,
    provider: IdentityProvider,
    providerSubject: string,
    displayName: string,
  ): Promise<User> {
    await this.lockIdentity(manager, provider, providerSubject);
    const identities = manager.getRepository(AuthIdentity);
    const existing = await identities.findOne({
      where: { provider, providerSubject },
      relations: { user: true },
      lock: { mode: 'pessimistic_write' },
    });

    if (existing) {
      this.assertActive(existing.user);
      return existing.user;
    }

    const user = await manager.getRepository(User).save(
      manager.getRepository(User).create({
        displayName: displayName.trim().slice(0, 100) || 'Student',
        status: 'active',
        deletedAt: null,
      }),
    );

    const studentRole = await manager
      .getRepository(Role)
      .findOneBy({ code: 'STUDENT' });
    if (!studentRole) {
      throw new InternalServerErrorException(
        'Default student role is not available.',
      );
    }

    await manager
      .getRepository(UserRole)
      .save(
        manager.getRepository(UserRole).create({ user, role: studentRole }),
      );
    await identities.save(
      identities.create({
        user,
        provider,
        providerSubject,
        verifiedAt: new Date(),
        metadata: null,
      }),
    );

    return user;
  }

  async link(
    manager: EntityManager,
    userId: string,
    provider: IdentityProvider,
    providerSubject: string,
  ): Promise<void> {
    await this.lockIdentity(manager, provider, providerSubject);
    const users = manager.getRepository(User);
    const user = await users.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('Authentication is required.');
    this.assertActive(user);

    const identities = manager.getRepository(AuthIdentity);
    const existing = await identities.findOne({
      where: { provider, providerSubject },
      relations: { user: true },
      lock: { mode: 'pessimistic_write' },
    });

    if (existing) {
      if (existing.user.id !== userId) {
        throw new ConflictException('This identity is already linked.');
      }
      return;
    }

    await identities.save(
      identities.create({
        user,
        provider,
        providerSubject,
        verifiedAt: new Date(),
        metadata: null,
      }),
    );
  }

  private assertActive(user: User): void {
    if (user.status !== 'active' || user.deletedAt) {
      throw new UnauthorizedException('Authentication is required.');
    }
  }

  private async lockIdentity(
    manager: EntityManager,
    provider: IdentityProvider,
    providerSubject: string,
  ): Promise<void> {
    // A row lock cannot serialize the first insert because the row does not
    // exist yet. A transaction-scoped advisory lock closes that race.
    await manager.query(
      'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
      [`auth-identity:${provider}`, providerSubject],
    );
  }
}
