import type { Relation } from 'typeorm';
import { User } from './core.entity.js';
export declare class AuditLog {
    id: string;
    actor: Relation<User | null>;
    action: string;
    resourceType: string;
    resourceId: string | null;
    requestId: string | null;
    sourceIp: string | null;
    beforeState: Record<string, unknown> | null;
    afterState: Record<string, unknown> | null;
    createdAt: Date;
}
