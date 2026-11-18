import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './core.entity.js';

@Entity('audit_logs')
@Index('IDX_audit_logs_created', ['createdAt'])
@Index('IDX_audit_logs_actor_created', ['actor', 'createdAt'])
@Index('IDX_audit_logs_resource', ['resourceType', 'resourceId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_user_id' })
  actor!: Relation<User | null>;

  @Column({ type: 'varchar', length: 120 })
  action!: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 100 })
  resourceType!: string;

  @Column({ name: 'resource_id', type: 'uuid', nullable: true })
  resourceId!: string | null;

  @Column({ name: 'request_id', type: 'varchar', length: 100, nullable: true })
  requestId!: string | null;

  @Column({ name: 'source_ip', type: 'inet', nullable: true })
  sourceIp!: string | null;

  @Column({ name: 'before_state', type: 'jsonb', nullable: true })
  beforeState!: Record<string, unknown> | null;

  @Column({ name: 'after_state', type: 'jsonb', nullable: true })
  afterState!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
