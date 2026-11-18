import { ConfigService } from '@nestjs/config';
import type { JWTVerifyGetKey } from 'jose';
export declare const TELEGRAM_JWKS_RESOLVER: unique symbol;
export declare const TELEGRAM_ISSUER = "https://oauth.telegram.org";
export interface VerifiedTelegramIdentity {
    subject: string;
    nonce: string;
    issuedAt: number;
    displayName: string | null;
}
export declare class TelegramIdTokenVerifier {
    private readonly config;
    private readonly jwksResolver;
    constructor(config: ConfigService, jwksResolver: JWTVerifyGetKey);
    verify(idToken: string): Promise<VerifiedTelegramIdentity>;
}
