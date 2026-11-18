import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AdminPaymentQueryDto, ClickCallbackDto, CreatePaymentDto, PaymeRpcDto, RefundDto } from './payments.dto.js';
import { PaymentsService } from './payments.service.js';
import { PaymeProvider } from './payme.provider.js';
import { ClickCallbackService } from './click-callback.service.js';
export declare class PaymentsController {
    private readonly service;
    private readonly payme;
    private readonly click;
    constructor(service: PaymentsService, payme: PaymeProvider, click: ClickCallbackService);
    create(dto: CreatePaymentDto, u: AuthenticatedUser): Promise<{
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
    mine(u: AuthenticatedUser, page?: string, limit?: string): Promise<{
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
    detail(id: string, u: AuthenticatedUser): Promise<{
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
    paymeCallback(auth: string | undefined, request: PaymeRpcDto): Promise<unknown> | {
        jsonrpc: string;
        id: string | number | null;
        error: {
            code: number;
            message: string;
        };
    };
    clickPrepare(p: ClickCallbackDto): Promise<{
        error: number;
        error_note: string;
        merchant_prepare_id: number;
        click_trans_id: number;
        merchant_trans_id: string;
    } | {
        error: number;
        error_note: string;
        merchant_confirm_id: number;
        click_trans_id: number;
        merchant_trans_id: string;
    }>;
    clickComplete(p: ClickCallbackDto): Promise<{
        error: number;
        error_note: string;
        merchant_prepare_id: number;
        click_trans_id: number;
        merchant_trans_id: string;
    } | {
        error: number;
        error_note: string;
        merchant_confirm_id: number;
        click_trans_id: number;
        merchant_trans_id: string;
    }>;
}
export declare class AdminPaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    list(q: AdminPaymentQueryDto): Promise<{
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
    statistics(): Promise<{
        status: string;
        count: number;
        amountMinor: string;
    }[]>;
    detail(id: string): Promise<{
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
    refund(id: string, d: RefundDto, u: AuthenticatedUser): Promise<{
        id: string;
        status: "succeeded";
    }>;
}
