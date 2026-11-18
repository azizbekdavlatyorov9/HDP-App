import { ConfigService } from '@nestjs/config';
import type { Payment } from '../../database/entities/payments.entity.js';
import type { PaymentProvider, CheckoutInfo } from './payment-provider.js';
export declare class ClickProvider implements PaymentProvider {
    private readonly config;
    readonly name: "click";
    constructor(config: ConfigService);
    assertConfigured(): void;
    createCheckout(payment: Payment): CheckoutInfo;
    verifySignature(params: {
        click_trans_id: string;
        service_id: string;
        merchant_trans_id: string;
        merchant_prepare_id?: string;
        amount: string;
        action: number;
        sign_time: string;
        sign_string: string;
    }, action: 0 | 1): boolean;
    refund(_payment: Payment, _providerTransactionId: string): Promise<void>;
}
export declare function minorToMajor(minor: string): string;
export declare function majorToMinor(amount: string): string | null;
