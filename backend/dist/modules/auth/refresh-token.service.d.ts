import { DataSource, Repository } from 'typeorm';
import { RefreshToken, User } from '../../database/entities/core.entity.js';
import type { RequestMetadata } from './interfaces/authenticated-user.js';
export interface RotatedRefreshToken {
    user: User;
    refreshToken: string;
}
export declare class RefreshTokenService {
    private readonly dataSource;
    private readonly refreshTokens;
    static readonly lifetimeMs: number;
    constructor(dataSource: DataSource, refreshTokens: Repository<RefreshToken>);
    create(user: User, metadata: RequestMetadata): Promise<string>;
    rotate(rawToken: string, metadata: RequestMetadata): Promise<RotatedRefreshToken>;
    revoke(userId: string, rawToken?: string): Promise<void>;
    private newToken;
    private hash;
}
