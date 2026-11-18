import { EntityManager } from 'typeorm';
import { User } from '../../database/entities/core.entity.js';
export type IdentityProvider = 'telegram' | 'phone';
export declare class IdentityService {
    createUnlinkedStudent(manager: EntityManager, displayName: string): Promise<User>;
    findOrCreate(manager: EntityManager, provider: IdentityProvider, providerSubject: string, displayName: string): Promise<User>;
    link(manager: EntityManager, userId: string, provider: IdentityProvider, providerSubject: string): Promise<void>;
    private assertActive;
    private lockIdentity;
}
