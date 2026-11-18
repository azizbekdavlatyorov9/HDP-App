import { ServiceUnavailableException } from '@nestjs/common';

export abstract class SmsProvider {
  abstract sendVerificationCode(
    phoneNumber: string,
    code: string,
  ): Promise<void>;
}

/** Safe default until a real SMS integration is configured. */
export class UnconfiguredSmsProvider extends SmsProvider {
  async sendVerificationCode(
    _phoneNumber: string,
    _code: string,
  ): Promise<void> {
    throw new ServiceUnavailableException(
      'Phone verification is temporarily unavailable.',
    );
  }
}
