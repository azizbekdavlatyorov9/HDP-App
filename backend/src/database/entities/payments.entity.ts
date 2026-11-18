import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './core.entity.js';
import { Course } from './education.entity.js';

@Entity('payments')
@Check(
  'CHK_payments_status',
  "\"status\" IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded')",
)
@Check('CHK_payments_amount_minor', '"amount_minor" >= 0')
@Unique('UQ_payments_user_idempotency', ['user', 'idempotencyKey'])
@Index('IDX_payments_course_status_created', ['course', 'status', 'createdAt'])
@Index('IDX_payments_user_created', ['user', 'createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.payments, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @ManyToOne(() => Course, (course) => course.payments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Relation<Course>;

  @Column({ name: 'amount_minor', type: 'bigint' })
  amountMinor!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({ type: 'varchar', length: 24, default: 'pending' })
  status!:
    | 'pending'
    | 'processing'
    | 'succeeded'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';

  @Column({ name: 'idempotency_key', type: 'varchar', length: 128 })
  idempotencyKey!: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => PaymentTransaction, (transaction) => transaction.payment)
  transactions!: Relation<PaymentTransaction[]>;
}

@Entity('payment_transactions')
@Check(
  'CHK_payment_transactions_provider',
  "\"provider\" IN ('payme', 'click')",
)
@Check(
  'CHK_payment_transactions_status',
  "\"status\" IN ('initiated', 'pending', 'succeeded', 'failed', 'refunded')",
)
@Unique('UQ_payment_transactions_provider_tx', [
  'provider',
  'providerTransactionId',
])
@Unique('UQ_payment_transactions_provider_event', [
  'provider',
  'providerEventId',
])
@Index('UQ_payment_transactions_click_prepare', ['clickPrepareId'], { unique: true })
@Index('IDX_payment_transactions_payment_created', ['payment', 'createdAt'])
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Payment, (payment) => payment.transactions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'payment_id' })
  payment!: Relation<Payment>;

  @Column({ type: 'varchar', length: 16 })
  provider!: 'payme' | 'click';

  @Column({
    name: 'provider_transaction_id',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  providerTransactionId!: string | null;

  @Column({
    name: 'provider_event_id',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  providerEventId!: string | null;

  @Column({
    name: 'click_prepare_id',
    type: 'bigint',
    nullable: true,
    default: () => "nextval('click_prepare_id_seq'::regclass)",
  })
  clickPrepareId!: string | null;

  @Column({ type: 'varchar', length: 20 })
  status!: 'initiated' | 'pending' | 'succeeded' | 'failed' | 'refunded';

  @Column({ name: 'event_type', type: 'varchar', length: 80, nullable: true })
  eventType!: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz', nullable: true })
  occurredAt!: Date | null;

  @Column({ name: 'provider_created_at', type: 'timestamptz', nullable: true })
  providerCreatedAt!: Date | null;

  @Column({ name: 'provider_performed_at', type: 'timestamptz', nullable: true })
  providerPerformedAt!: Date | null;

  @Column({ name: 'provider_cancelled_at', type: 'timestamptz', nullable: true })
  providerCancelledAt!: Date | null;

  @Column({ name: 'provider_cancel_reason', type: 'integer', nullable: true })
  providerCancelReason!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
