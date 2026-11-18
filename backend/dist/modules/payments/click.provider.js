var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createHash, timingSafeEqual } from 'node:crypto';
import { Injectable, NotImplementedException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
let ClickProvider = class ClickProvider {
    config;
    name = 'click';
    constructor(config) {
        this.config = config;
    }
    assertConfigured() { if (!this.config.get('CLICK_SERVICE_ID') || !this.config.get('CLICK_MERCHANT_ID') || !this.config.get('CLICK_SECRET_KEY'))
        throw new ServiceUnavailableException('Click is not configured'); }
    createCheckout(payment) { this.assertConfigured(); const serviceId = this.config.get('CLICK_SERVICE_ID'); const merchantId = this.config.get('CLICK_MERCHANT_ID'); return { provider: this.name, parameters: { serviceId, merchantId, merchantTransId: payment.id, amount: minorToMajor(payment.amountMinor), currency: payment.currency } }; }
    verifySignature(params, action) {
        const secret = this.config.get('CLICK_SECRET_KEY');
        const serviceId = this.config.get('CLICK_SERVICE_ID');
        if (!secret || !serviceId || params.service_id !== serviceId || params.action !== action)
            return false;
        const source = action === 0 ? `${params.click_trans_id}${params.service_id}${secret}${params.merchant_trans_id}${params.amount}${params.action}${params.sign_time}` : `${params.click_trans_id}${params.service_id}${secret}${params.merchant_trans_id}${params.merchant_prepare_id ?? ''}${params.amount}${params.action}${params.sign_time}`;
        const expected = Buffer.from(createHash('md5').update(source, 'utf8').digest('hex'));
        const actual = Buffer.from(params.sign_string.toLowerCase());
        return expected.length === actual.length && timingSafeEqual(expected, actual);
    }
    async refund(_payment, _providerTransactionId) { throw new NotImplementedException('Click refund or reversal requires a separately enabled merchant API operation; the configured Shop API callback protocol does not initiate refunds'); }
};
ClickProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], ClickProvider);
export { ClickProvider };
export function minorToMajor(minor) { const n = BigInt(minor); const whole = n / 100n; const fraction = (n % 100n).toString().padStart(2, '0'); return `${whole}.${fraction}`; }
export function majorToMinor(amount) { if (!/^\d+(?:\.\d{1,2})?$/.test(amount))
    return null; const [whole, frac = ''] = amount.split('.'); return (BigInt(whole) * 100n + BigInt(frac.padEnd(2, '0'))).toString(); }
//# sourceMappingURL=click.provider.js.map