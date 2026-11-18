import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Course, Enrollment, Payment, PaymentTransaction } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import type { AdminPaymentQueryDto, CreatePaymentDto, PaymeRpcDto } from './payments.dto.js';
import { ClickProvider } from './click.provider.js';
import { PaymeProvider } from './payme.provider.js';
import { NotificationsService } from '../notifications/notifications.service.js';
type Manager = EntityManager;
export declare class PaymentsService {
    private readonly payments;
    private readonly transactions;
    private readonly courses;
    private readonly enrollments;
    private readonly db;
    private readonly payme;
    private readonly click;
    private readonly config;
    private readonly notifications?;
    constructor(payments: Repository<Payment>, transactions: Repository<PaymentTransaction>, courses: Repository<Course>, enrollments: Repository<Enrollment>, db: DataSource, payme: PaymeProvider, click: ClickProvider, config: ConfigService, notifications?: NotificationsService | undefined);
    private provider;
    private expireStalePayments;
    private paymentView;
    create(dto: CreatePaymentDto, user: AuthenticatedUser): Promise<{
        payment: {
            id: string;
            course: {
                id: string;
                title: string;
            };
            amountMinor: string;
            currency: string;
            status: "pending" | "processing" | "succeeded" | "failed" | "refunded" | "partially_refunded";
            paidAt: Date | null;
            refundedAt: Date | null;
            createdAt: Date;
            transactions: {
                id: string;
                provider: "payme" | "click";
                providerTransactionId: string | null;
                status: "pending" | "succeeded" | "failed" | "refunded" | "initiated";
                eventType: string | null;
                occurredAt: Date | null;
                createdAt: Date;
            }[];
        };
        checkout: import("./payment-provider.js").CheckoutInfo;
    }>;
    mine(user: AuthenticatedUser, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            course: {
                id: string;
                title: string;
            };
            amountMinor: string;
            currency: string;
            status: "pending" | "processing" | "succeeded" | "failed" | "refunded" | "partially_refunded";
            paidAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    ownDetail(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        course: {
            id: string;
            title: string;
        };
        amountMinor: string;
        currency: string;
        status: "pending" | "processing" | "succeeded" | "failed" | "refunded" | "partially_refunded";
        paidAt: Date | null;
        refundedAt: Date | null;
        createdAt: Date;
        transactions: {
            id: string;
            provider: "payme" | "click";
            providerTransactionId: string | null;
            status: "pending" | "succeeded" | "failed" | "refunded" | "initiated";
            eventType: string | null;
            occurredAt: Date | null;
            createdAt: Date;
        }[];
    }>;
    adminList(q: AdminPaymentQueryDto): Promise<{
        data: {
            id: string;
            user: {
                id: string;
                displayName: string;
            };
            course: {
                id: string;
                title: string;
            };
            amountMinor: string;
            currency: string;
            status: "pending" | "processing" | "succeeded" | "failed" | "refunded" | "partially_refunded";
            paidAt: Date | null;
            refundedAt: Date | null;
            createdAt: Date;
            transactions: {
                id: string;
                provider: "payme" | "click";
                providerTransactionId: string | null;
                providerEventId: string | null;
                clickPrepareId: string | null;
                status: "pending" | "succeeded" | "failed" | "refunded" | "initiated";
                eventType: string | null;
                occurredAt: Date | null;
                createdAt: Date;
            }[];
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    private adminMap;
    adminDetail(id: string): Promise<{
        id: string;
        user: {
            id: string;
            displayName: string;
        };
        course: {
            id: string;
            title: string;
        };
        amountMinor: string;
        currency: string;
        status: "pending" | "processing" | "succeeded" | "failed" | "refunded" | "partially_refunded";
        paidAt: Date | null;
        refundedAt: Date | null;
        createdAt: Date;
        transactions: {
            id: string;
            provider: "payme" | "click";
            providerTransactionId: string | null;
            providerEventId: string | null;
            clickPrepareId: string | null;
            status: "pending" | "succeeded" | "failed" | "refunded" | "initiated";
            eventType: string | null;
            occurredAt: Date | null;
            createdAt: Date;
        }[];
    }>;
    statistics(): Promise<{
        status: string;
        count: number;
        amountMinor: string;
    }[]>;
    refund(id: string, actor: AuthenticatedUser, reason?: string): Promise<{
        id: string;
        status: "succeeded";
    }>;
    expirePayment(manager: Manager, payment: Payment, tx: PaymentTransaction): Promise<boolean>;
    private activateEnrollment;
    private paymeError;
    paymeRpc(request: PaymeRpcDto): Promise<unknown>;
    private notifyPayment;
    private paymeCheck;
    private paymeCreate;
    private paymePerform;
    private paymeCancel;
    private paymeCheckTransaction;
    private paymeStatement;
}
export {};
