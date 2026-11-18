import { DataSource, Repository } from 'typeorm';
import { AuthChallenge, User } from '../../database/entities/core.entity.js';
import { IdentityService } from './identity.service.js';
import { TelegramIdTokenVerifier } from './telegram-id-token-verifier.js';
export interface TelegramChallenge {
    nonce: string;
    expiresAt: Date;
}
export declare class TelegramAuthService {
    private readonly dataSource;
    private readonly challenges;
    private readonly identityService;
    private readonly verifier;
    constructor(dataSource: DataSource, challenges: Repository<AuthChallenge>, identityService: IdentityService, verifier: TelegramIdTokenVerifier);
    createLoginChallenge(): Promise<TelegramChallenge>;
    createLinkChallenge(userId: string): Promise<TelegramChallenge>;
    authenticate(idToken: string): Promise<User>;
    link(userId: string, idToken: string): Promise<void>;
    private createChallenge;
    private hash;
}
