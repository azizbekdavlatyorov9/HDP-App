var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { User } from './core.entity.js';
let AuditLog = class AuditLog {
    id;
    actor;
    action;
    resourceType;
    resourceId;
    requestId;
    sourceIp;
    beforeState;
    afterState;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'actor_user_id' }),
    __metadata("design:type", Object)
], AuditLog.prototype, "actor", void 0);
__decorate([
    Column({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    Column({ name: 'resource_type', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], AuditLog.prototype, "resourceType", void 0);
__decorate([
    Column({ name: 'resource_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "resourceId", void 0);
__decorate([
    Column({ name: 'request_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "requestId", void 0);
__decorate([
    Column({ name: 'source_ip', type: 'inet', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "sourceIp", void 0);
__decorate([
    Column({ name: 'before_state', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "beforeState", void 0);
__decorate([
    Column({ name: 'after_state', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "afterState", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
AuditLog = __decorate([
    Entity('audit_logs'),
    Index('IDX_audit_logs_created', ['createdAt']),
    Index('IDX_audit_logs_actor_created', ['actor', 'createdAt']),
    Index('IDX_audit_logs_resource', ['resourceType', 'resourceId', 'createdAt'])
], AuditLog);
export { AuditLog };
//# sourceMappingURL=audit-log.entity.js.map