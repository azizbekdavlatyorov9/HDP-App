import type { Relation } from 'typeorm';
import { User } from './core.entity.js';
import { Course } from './education.entity.js';
export declare class Payment {
    id: string;
    user: Relation<User>;
    course: Relation<Course>;
    amountMinor: string;
    currency: string;
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
    idempotencyKey: string;
    paidAt: Date | null;
    refundedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    transactions: Relation<PaymentTransaction[]>;
}
export declare class PaymentTransaction {
    id: string;
    payment: Relation<Payment>;
    provider: 'payme' | 'click';
    providerTransactionId: string | null;
    providerEventId: string | null;
    clickPrepareId: string | null;
    status: 'initiated' | 'pending' | 'succeeded' | 'failed' | 'refunded';
    eventType: string | null;
    occurredAt: Date | null;
    providerCreatedAt: Date | null;
    providerPerformedAt: Date | null;
    providerCancelledAt: Date | null;
    providerCancelReason: number | null;
    createdAt: Date;
}
