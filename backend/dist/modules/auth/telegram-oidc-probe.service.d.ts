import { ConfigService } from '@nestjs/config';
import { TelegramAuthService } from './telegram-auth.service.js';
import { TelegramIdTokenVerifier } from './telegram-id-token-verifier.js';
type ProbeResult = 'PASS' | 'FAIL';
export declare class TelegramOidcProbeService {
    private readonly config;
    private readonly telegramAuth;
    private readonly verifier;
    private readonly transactions;
    private readonly outcomes;
    constructor(config: ConfigService, telegramAuth: TelegramAuthService, verifier: TelegramIdTokenVerifier);
    start(): Promise<{
        authorizationUrl: string;
        probeId: string;
    }>;
    getResult(probeId: string | undefined): ProbeResult;
    complete(code: string | undefined, state: string | undefined): Promise<ProbeResult>;
    private requireSettings;
    private isTokenResponse;
    private removeExpiredTransactions;
}
export {};
