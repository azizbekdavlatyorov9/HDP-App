import { ConfigService } from '@nestjs/config';
import type { Payment } from '../../database/entities/payments.entity.js';
import type { PaymentProvider, CheckoutInfo } from './payment-provider.js';
export declare class PaymeProvider implements PaymentProvider {
    private readonly config;
    readonly name: "payme";
    constructor(config: ConfigService);
    assertConfigured(): void;
    createCheckout(payment: Payment): CheckoutInfo;
    refund(_payment: Payment, _providerTransactionId: string): Promise<void>;
    verifyAuthorization(header: string | undefined): boolean;
}
