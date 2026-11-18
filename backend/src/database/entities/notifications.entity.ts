import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './core.entity.js';

export enum NotificationType {
  GENERAL = 'GENERAL', COURSE_PUBLISHED = 'COURSE_PUBLISHED', NEW_LESSON = 'NEW_LESSON',
  LESSON_UPDATED = 'LESSON_UPDATED', TEST_AVAILABLE = 'TEST_AVAILABLE', TEST_RESULT = 'TEST_RESULT',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS', PAYMENT_FAILED = 'PAYMENT_FAILED', PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  ENROLLMENT_CREATED = 'ENROLLMENT_CREATED', SCHEDULE_UPDATED = 'SCHEDULE_UPDATED', ANNOUNCEMENT = 'ANNOUNCEMENT',
}
export type NotificationDeliveryStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'unavailable';

@Entity('notifications')
@Check('CHK_notifications_type', `"type" IN (${Object.values(NotificationType).map((v) => `'${v}'`).join(', ')})`)
@Check('CHK_notifications_delivery_status', `"delivery_status" IN ('pending','sending','sent','failed','unavailable')`)
@Index('UQ_notifications_event_key', ['eventKey'], { unique: true })
@Index('IDX_notifications_recipient_created', ['recipient', 'createdAt'])
@Index('IDX_notifications_recipient_read_created', ['recipient', 'readAt', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' }) @JoinColumn({ name: 'recipient_user_id' }) recipient!: Relation<User>;
  @Column({ type: 'varchar', length: 80 }) type!: NotificationType;
  @Column({ type: 'varchar', length: 160 }) title!: string;
  @Column({ type: 'varchar', length: 1000 }) body!: string;
  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true }) relatedEntityId!: string | null;
  @Column({ type: 'jsonb', nullable: true }) metadata!: Record<string, string | number | boolean> | null;
  @Column({ name: 'event_key', type: 'varchar', length: 200, nullable: true }) eventKey!: string | null;
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true }) readAt!: Date | null;
  @Column({ name: 'delivery_status', type: 'varchar', length: 20, default: 'pending' }) deliveryStatus!: NotificationDeliveryStatus;
  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true }) deliveredAt!: Date | null;
  @Column({ name: 'delivery_error_code', type: 'varchar', length: 100, nullable: true }) deliveryErrorCode!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Entity('device_tokens')
@Check('CHK_device_tokens_platform', `"platform" IN ('ANDROID','IOS')`)
@Index('UQ_device_tokens_active_token', ['token'], { unique: true, where: '"is_active" = true' })
@Index('IDX_device_tokens_user_active', ['user', 'isActive'])
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user!: Relation<User>;
  @Column({ type: 'text' }) token!: string;
  @Column({ type: 'varchar', length: 10 }) platform!: 'ANDROID' | 'IOS';
  @Column({ name: 'device_name', type: 'varchar', length: 100, nullable: true }) deviceName!: string | null;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive!: boolean;
  @Column({ name: 'last_seen_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) lastSeenAt!: Date;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
