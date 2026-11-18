import type { Payment } from '../../database/entities/payments.entity.js';
export type PaymentProviderName = 'payme' | 'click';
export interface CheckoutInfo {
    provider: PaymentProviderName;
    checkoutUrl?: string;
    parameters?: Record<string, string>;
}
export interface PaymentProvider {
    readonly name: PaymentProviderName;
    assertConfigured(): void;
    createCheckout(payment: Payment): CheckoutInfo;
    refund(payment: Payment, providerTransactionId: string): Promise<void>;
}
export declare const PAYMENT_PROVIDERS: unique symbol;
