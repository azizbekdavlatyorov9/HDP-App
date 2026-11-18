import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserProfileDto } from '../users/dto/user-profile.dto.js';
import { UsersService } from '../users/users.service.js';
import type { AuthenticatedUser, RequestMetadata } from './interfaces/authenticated-user.js';
import { PhoneAuthService } from './phone-auth.service.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { TelegramAuthService } from './telegram-auth.service.js';
export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
    expiresIn: 900;
    user: UserProfileDto;
}
export declare class AuthService {
    private readonly telegramAuth;
    private readonly phoneAuth;
    private readonly refreshTokens;
    private readonly jwt;
    private readonly config;
    private readonly users;
    constructor(telegramAuth: TelegramAuthService, phoneAuth: PhoneAuthService, refreshTokens: RefreshTokenService, jwt: JwtService, config: ConfigService, users: UsersService);
    loginWithTelegram(idToken: string, metadata: RequestMetadata): Promise<AuthSession>;
    loginWithPhone(phoneNumber: string, code: string, metadata: RequestMetadata): Promise<AuthSession>;
    refresh(refreshToken: string, metadata: RequestMetadata): Promise<AuthSession>;
    logout(userId: string, refreshToken?: string): Promise<void>;
    getMe(user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        email: null;
        roles: string[];
    }>;
    private createSession;
    private toSession;
}
