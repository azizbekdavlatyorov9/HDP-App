import { createHash,timingSafeEqual } from 'node:crypto';
import { Injectable, NotImplementedException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Payment } from '../../database/entities/payments.entity.js';
import type { PaymentProvider,CheckoutInfo } from './payment-provider.js';

@Injectable()
export class ClickProvider implements PaymentProvider {
 readonly name='click' as const;
 constructor(private readonly config:ConfigService){}
 assertConfigured(){if(!this.config.get<string>('CLICK_SERVICE_ID')||!this.config.get<string>('CLICK_MERCHANT_ID')||!this.config.get<string>('CLICK_SECRET_KEY'))throw new ServiceUnavailableException('Click is not configured');}
 createCheckout(payment:Payment):CheckoutInfo{this.assertConfigured();const serviceId=this.config.get<string>('CLICK_SERVICE_ID')!;const merchantId=this.config.get<string>('CLICK_MERCHANT_ID')!;return {provider:this.name,parameters:{serviceId,merchantId,merchantTransId:payment.id,amount:minorToMajor(payment.amountMinor),currency:payment.currency}};}
 verifySignature(params:{click_trans_id:string;service_id:string;merchant_trans_id:string;merchant_prepare_id?:string;amount:string;action:number;sign_time:string;sign_string:string},action:0|1){
  const secret=this.config.get<string>('CLICK_SECRET_KEY');const serviceId=this.config.get<string>('CLICK_SERVICE_ID');if(!secret||!serviceId||params.service_id!==serviceId||params.action!==action)return false;
  const source=action===0?`${params.click_trans_id}${params.service_id}${secret}${params.merchant_trans_id}${params.amount}${params.action}${params.sign_time}`:`${params.click_trans_id}${params.service_id}${secret}${params.merchant_trans_id}${params.merchant_prepare_id??''}${params.amount}${params.action}${params.sign_time}`;
  const expected=Buffer.from(createHash('md5').update(source,'utf8').digest('hex'));const actual=Buffer.from(params.sign_string.toLowerCase());return expected.length===actual.length&&timingSafeEqual(expected,actual);
 }
 async refund(_payment:Payment,_providerTransactionId:string):Promise<void>{throw new NotImplementedException('Click refund or reversal requires a separately enabled merchant API operation; the configured Shop API callback protocol does not initiate refunds');}
}
export function minorToMajor(minor:string){const n=BigInt(minor);const whole=n/100n;const fraction=(n%100n).toString().padStart(2,'0');return `${whole}.${fraction}`;}
export function majorToMinor(amount:string){if(!/^\d+(?:\.\d{1,2})?$/.test(amount))return null;const [whole,frac='']=amount.split('.');return (BigInt(whole!)*100n+BigInt(frac.padEnd(2,'0'))).toString();}
