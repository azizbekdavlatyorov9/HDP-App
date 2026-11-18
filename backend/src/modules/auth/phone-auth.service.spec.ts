import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PhoneVerification } from '../../database/entities/core.entity.js';
import {
  MemoryDataSource,
  MemoryRepository,
} from '../../../test/auth-test-helpers.js';
import { IdentityService } from './identity.service.js';
import { PhoneAuthService } from './phone-auth.service.js';
import { SmsProvider } from './sms-provider.js';

describe('PhoneAuthService', () => {
  const phone = '+12025550123';
  const secret = 'test-only-otp-pepper-with-sufficient-length';

  function setup() {
    const verifications = new MemoryRepository<PhoneVerification>();
    const dataSource = new MemoryDataSource(
      new Map([[PhoneVerification, verifications]]),
    );
    let sentCode = '';
    const sms = {
      sendVerificationCode: vi.fn(async (_number: string, code: string) => {
        sentCode = code;
      }),
    };
    const config = { get: () => secret };
    const identities = { findOrCreate: vi.fn() };
    const service = new PhoneAuthService(
      dataSource as never,
      verifications as never,
      identities as unknown as IdentityService,
      sms as unknown as SmsProvider,
      config as unknown as ConfigService,
    );
    return {
      service,
      verifications,
      sms,
      identities,
      getSentCode: () => sentCode,
    };
  }

  it('normalizes accepted numbers to E.164 and rejects local formats', () => {
    const { service } = setup();
    expect(service.normalizePhoneNumber('+1 (202) 555-0123')).toBe(phone);
    expect(() => service.normalizePhoneNumber('2025550123')).toThrow();
  });

  it('expires OTPs after five minutes and consumes an expired challenge', async () => {
    const { service, verifications } = setup();
    await service.requestLoginCode(phone, {});
    verifications.items[0].expiresAt = new Date(Date.now() - 1);

    await expect(
      service.verifyLoginCode(phone, '123456'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(verifications.items[0].consumedAt).toBeInstanceOf(Date);
  });

  it('counts incorrect attempts and consumes a code after five failures', async () => {
    const { service, verifications, getSentCode } = setup();
    await service.requestLoginCode(phone, {});
    const wrongCode = getSentCode() === '000000' ? '000001' : '000000';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        service.verifyLoginCode(phone, wrongCode),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }

    expect(verifications.items[0].attemptCount).toBe(5);
    expect(verifications.items[0].consumedAt).toBeInstanceOf(Date);
    await expect(
      service.verifyLoginCode(phone, getSentCode()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('enforces the 60-second resend cooldown without revealing account state', async () => {
    const { service, sms } = setup();
    const response = await service.requestLoginCode(phone, {});
    const secondResponse = await service.requestLoginCode(phone, {});

    expect(response).toEqual(secondResponse);
    expect(response.message).toMatch(/If this number/);
    expect(sms.sendVerificationCode).toHaveBeenCalledTimes(1);
  });

  it('stores a keyed digest rather than the delivered OTP', async () => {
    const { service, verifications, getSentCode } = setup();
    await service.requestLoginCode(phone, {});

    expect(verifications.items[0].codeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(verifications.items[0].codeHash).not.toBe(getSentCode());
    expect(JSON.stringify(verifications.items[0])).not.toContain(getSentCode());
  });
});
