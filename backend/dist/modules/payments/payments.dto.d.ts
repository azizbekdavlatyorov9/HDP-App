import type { PaymentProviderName } from './payment-provider.js';
export declare class CreatePaymentDto {
    courseId: string;
    provider: PaymentProviderName;
    idempotencyKey: string;
}
export declare class AdminPaymentQueryDto {
    status?: string;
    provider?: PaymentProviderName;
    userId?: string;
    from?: string;
    to?: string;
    page?: string;
    limit?: string;
}
export declare class RefundDto {
    reason?: string;
}
export declare class PaymeRpcDto {
    jsonrpc: string;
    id?: string | number | null;
    method: string;
    params: Record<string, unknown>;
}
export declare class ClickCallbackDto {
    click_trans_id: string;
    service_id: string;
    merchant_trans_id: string;
    merchant_prepare_id?: string;
    amount: string;
    action: number;
    sign_time: string;
    sign_string: string;
    error?: number;
    error_note?: string;
    click_paydoc_id?: string;
}
