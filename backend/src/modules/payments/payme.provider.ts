import { Injectable, NotImplementedException, ServiceUnavailableException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import type { Payment } from '../../database/entities/payments.entity.js';
import type { PaymentProvider,CheckoutInfo } from './payment-provider.js';

@Injectable()
export class PaymeProvider implements PaymentProvider {
  readonly name='payme' as const;
  constructor(private readonly config:ConfigService){}
  assertConfigured(){if(!this.config.get<string>('PAYME_MERCHANT_ID')||!this.config.get<string>('PAYME_MERCHANT_PASSWORD'))throw new ServiceUnavailableException('Payme is not configured');}
  createCheckout(payment:Payment):CheckoutInfo{this.assertConfigured();const merchant=this.config.get<string>('PAYME_MERCHANT_ID')!;const returnUrl=this.config.get<string>('PAYME_RETURN_URL');const fields=[`m=${merchant}`,`ac.order_id=${payment.id}`,`a=${payment.amountMinor}`,...(returnUrl?[`c=${returnUrl}`]:[]),'cr=860'];const encoded=Buffer.from(fields.join(';')).toString('base64');return {provider:this.name,checkoutUrl:`https://checkout.paycom.uz/${encodeURIComponent(encoded)}`};}
  async refund(_payment:Payment,_providerTransactionId:string):Promise<void>{throw new NotImplementedException('Payme refunds must be issued in the Payme merchant cabinet; provider initiated cancellations are handled through CancelTransaction');}
  verifyAuthorization(header:string|undefined):boolean{const username='Paycom';const password=this.config.get<string>('PAYME_MERCHANT_PASSWORD');if(!header||!password)return false;const match=/^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header);if(!match)return false;const value=match[1]!;const actual=Buffer.from(value,'base64');if(actual.toString('base64')!==value)return false;const expected=Buffer.from(`${username}:${password}`);return actual.length===expected.length&&timingSafeEqual(actual,expected);}
}
