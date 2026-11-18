var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';
import { User } from './core.entity.js';
import { Course } from './education.entity.js';
let Payment = class Payment {
    id;
    user;
    course;
    amountMinor;
    currency;
    status;
    idempotencyKey;
    paidAt;
    refundedAt;
    createdAt;
    updatedAt;
    transactions;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.payments, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], Payment.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Course, (course) => course.payments, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], Payment.prototype, "course", void 0);
__decorate([
    Column({ name: 'amount_minor', type: 'bigint' }),
    __metadata("design:type", String)
], Payment.prototype, "amountMinor", void 0);
__decorate([
    Column({ type: 'char', length: 3 }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    Column({ type: 'varchar', length: 24, default: 'pending' }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    Column({ name: 'idempotency_key', type: 'varchar', length: 128 }),
    __metadata("design:type", String)
], Payment.prototype, "idempotencyKey", void 0);
__decorate([
    Column({ name: 'paid_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "paidAt", void 0);
__decorate([
    Column({ name: 'refunded_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "refundedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
__decorate([
    OneToMany(() => PaymentTransaction, (transaction) => transaction.payment),
    __metadata("design:type", Object)
], Payment.prototype, "transactions", void 0);
Payment = __decorate([
    Entity('payments'),
    Check('CHK_payments_status', "\"status\" IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded')"),
    Check('CHK_payments_amount_minor', '"amount_minor" >= 0'),
    Unique('UQ_payments_user_idempotency', ['user', 'idempotencyKey']),
    Index('IDX_payments_course_status_created', ['course', 'status', 'createdAt']),
    Index('IDX_payments_user_created', ['user', 'createdAt'])
], Payment);
export { Payment };
let PaymentTransaction = class PaymentTransaction {
    id;
    payment;
    provider;
    providerTransactionId;
    providerEventId;
    clickPrepareId;
    status;
    eventType;
    occurredAt;
    providerCreatedAt;
    providerPerformedAt;
    providerCancelledAt;
    providerCancelReason;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Payment, (payment) => payment.transactions, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'payment_id' }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "payment", void 0);
__decorate([
    Column({ type: 'varchar', length: 16 }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "provider", void 0);
__decorate([
    Column({
        name: 'provider_transaction_id',
        type: 'varchar',
        length: 200,
        nullable: true,
    }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "providerTransactionId", void 0);
__decorate([
    Column({
        name: 'provider_event_id',
        type: 'varchar',
        length: 200,
        nullable: true,
    }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "providerEventId", void 0);
__decorate([
    Column({
        name: 'click_prepare_id',
        type: 'bigint',
        nullable: true,
        default: () => "nextval('click_prepare_id_seq'::regclass)",
    }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "clickPrepareId", void 0);
__decorate([
    Column({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "status", void 0);
__decorate([
    Column({ name: 'event_type', type: 'varchar', length: 80, nullable: true }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "eventType", void 0);
__decorate([
    Column({ name: 'occurred_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "occurredAt", void 0);
__decorate([
    Column({ name: 'provider_created_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "providerCreatedAt", void 0);
__decorate([
    Column({ name: 'provider_performed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "providerPerformedAt", void 0);
__decorate([
    Column({ name: 'provider_cancelled_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "providerCancelledAt", void 0);
__decorate([
    Column({ name: 'provider_cancel_reason', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "providerCancelReason", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentTransaction.prototype, "createdAt", void 0);
PaymentTransaction = __decorate([
    Entity('payment_transactions'),
    Check('CHK_payment_transactions_provider', "\"provider\" IN ('payme', 'click')"),
    Check('CHK_payment_transactions_status', "\"status\" IN ('initiated', 'pending', 'succeeded', 'failed', 'refunded')"),
    Unique('UQ_payment_transactions_provider_tx', [
        'provider',
        'providerTransactionId',
    ]),
    Unique('UQ_payment_transactions_provider_event', [
        'provider',
        'providerEventId',
    ]),
    Index('UQ_payment_transactions_click_prepare', ['clickPrepareId'], { unique: true }),
    Index('IDX_payment_transactions_payment_created', ['payment', 'createdAt'])
], PaymentTransaction);
export { PaymentTransaction };
//# sourceMappingURL=payments.entity.js.map