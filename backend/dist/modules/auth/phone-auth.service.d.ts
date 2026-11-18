import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { PhoneVerification, User } from '../../database/entities/core.entity.js';
import type { RequestMetadata } from './interfaces/authenticated-user.js';
import { IdentityService } from './identity.service.js';
import { SmsProvider } from './sms-provider.js';
export declare const GENERIC_PHONE_RESPONSE: {
    message: string;
};
export declare class PhoneAuthService {
    private readonly dataSource;
    private readonly verifications;
    private readonly identityService;
    private readonly smsProvider;
    private readonly config;
    constructor(dataSource: DataSource, verifications: Repository<PhoneVerification>, identityService: IdentityService, smsProvider: SmsProvider, config: ConfigService);
    requestLoginCode(rawPhoneNumber: string, metadata: RequestMetadata): Promise<typeof GENERIC_PHONE_RESPONSE>;
    requestLinkCode(rawPhoneNumber: string, userId: string, metadata: RequestMetadata): Promise<typeof GENERIC_PHONE_RESPONSE>;
    verifyLoginCode(rawPhoneNumber: string, code: string): Promise<User>;
    verifyLinkCode(rawPhoneNumber: string, code: string, userId: string): Promise<void>;
    normalizePhoneNumber(input: string): string;
    private requestCode;
    private consumeCode;
    private codeHash;
    private constantTimeEqual;
}
