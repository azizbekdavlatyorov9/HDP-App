var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotImplementedException, ServiceUnavailableException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
let PaymeProvider = class PaymeProvider {
    config;
    name = 'payme';
    constructor(config) {
        this.config = config;
    }
    assertConfigured() { if (!this.config.get('PAYME_MERCHANT_ID') || !this.config.get('PAYME_MERCHANT_PASSWORD'))
        throw new ServiceUnavailableException('Payme is not configured'); }
    createCheckout(payment) { this.assertConfigured(); const merchant = this.config.get('PAYME_MERCHANT_ID'); const returnUrl = this.config.get('PAYME_RETURN_URL'); const fields = [`m=${merchant}`, `ac.order_id=${payment.id}`, `a=${payment.amountMinor}`, ...(returnUrl ? [`c=${returnUrl}`] : []), 'cr=860']; const encoded = Buffer.from(fields.join(';')).toString('base64'); return { provider: this.name, checkoutUrl: `https://checkout.paycom.uz/${encodeURIComponent(encoded)}` }; }
    async refund(_payment, _providerTransactionId) { throw new NotImplementedException('Payme refunds must be issued in the Payme merchant cabinet; provider initiated cancellations are handled through CancelTransaction'); }
    verifyAuthorization(header) { const username = 'Paycom'; const password = this.config.get('PAYME_MERCHANT_PASSWORD'); if (!header || !password)
        return false; const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header); if (!match)
        return false; const value = match[1]; const actual = Buffer.from(value, 'base64'); if (actual.toString('base64') !== value)
        return false; const expected = Buffer.from(`${username}:${password}`); return actual.length === expected.length && timingSafeEqual(actual, expected); }
};
PaymeProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], PaymeProvider);
export { PaymeProvider };
//# sourceMappingURL=payme.provider.js.map