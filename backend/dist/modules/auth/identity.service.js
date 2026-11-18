var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException, } from '@nestjs/common';
import { AuthIdentity, Role, User, UserRole, } from '../../database/entities/core.entity.js';
let IdentityService = class IdentityService {
    async createUnlinkedStudent(manager, displayName) {
        const user = await manager.getRepository(User).save(manager.getRepository(User).create({
            displayName: displayName.trim().slice(0, 100) || 'Student', status: 'active', deletedAt: null,
        }));
        const studentRole = await manager.getRepository(Role).findOneBy({ code: 'STUDENT' });
        if (!studentRole)
            throw new InternalServerErrorException('Default student role is not available.');
        await manager.getRepository(UserRole).save(manager.getRepository(UserRole).create({ user, role: studentRole }));
        return user;
    }
    async findOrCreate(manager, provider, providerSubject, displayName) {
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
        const user = await manager.getRepository(User).save(manager.getRepository(User).create({
            displayName: displayName.trim().slice(0, 100) || 'Student',
            status: 'active',
            deletedAt: null,
        }));
        const studentRole = await manager
            .getRepository(Role)
            .findOneBy({ code: 'STUDENT' });
        if (!studentRole) {
            throw new InternalServerErrorException('Default student role is not available.');
        }
        await manager
            .getRepository(UserRole)
            .save(manager.getRepository(UserRole).create({ user, role: studentRole }));
        await identities.save(identities.create({
            user,
            provider,
            providerSubject,
            verifiedAt: new Date(),
            metadata: null,
        }));
        return user;
    }
    async link(manager, userId, provider, providerSubject) {
        await this.lockIdentity(manager, provider, providerSubject);
        const users = manager.getRepository(User);
        const user = await users.findOneBy({ id: userId });
        if (!user)
            throw new UnauthorizedException('Authentication is required.');
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
        await identities.save(identities.create({
            user,
            provider,
            providerSubject,
            verifiedAt: new Date(),
            metadata: null,
        }));
    }
    assertActive(user) {
        if (user.status !== 'active' || user.deletedAt) {
            throw new UnauthorizedException('Authentication is required.');
        }
    }
    async lockIdentity(manager, provider, providerSubject) {
        await manager.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [`auth-identity:${provider}`, providerSubject]);
    }
};
IdentityService = __decorate([
    Injectable()
], IdentityService);
export { IdentityService };
//# sourceMappingURL=identity.service.js.map