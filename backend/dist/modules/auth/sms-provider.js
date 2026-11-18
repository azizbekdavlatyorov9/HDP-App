import { ServiceUnavailableException } from '@nestjs/common';
export class SmsProvider {
}
export class UnconfiguredSmsProvider extends SmsProvider {
    async sendVerificationCode(_phoneNumber, _code) {
        throw new ServiceUnavailableException('Phone verification is temporarily unavailable.');
    }
}
//# sourceMappingURL=sms-provider.js.map