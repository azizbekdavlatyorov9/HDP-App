import type { Request } from 'express';
import type { AuthenticatedUser } from './interfaces/authenticated-user.js';
import { AuthService } from './auth.service.js';
import { PhoneAuthService } from './phone-auth.service.js';
import { TelegramAuthService } from './telegram-auth.service.js';
import { TelegramIdTokenDto } from './dto/telegram-id-token.dto.js';
import { RequestPhoneCodeDto, VerifyPhoneCodeDto } from './dto/phone-auth.dto.js';
import { LogoutDto, RefreshTokenDto } from './dto/refresh-token.dto.js';
export declare class AuthController {
    private readonly auth;
    private readonly telegram;
    private readonly phone;
    constructor(auth: AuthService, telegram: TelegramAuthService, phone: PhoneAuthService);
    createTelegramChallenge(): Promise<import("./telegram-auth.service.js").TelegramChallenge>;
    loginWithTelegram(input: TelegramIdTokenDto, request: Request): Promise<import("./auth.service.js").AuthSession>;
    requestPhoneCode(input: RequestPhoneCodeDto, request: Request): Promise<{
        message: string;
    }>;
    verifyPhoneCode(input: VerifyPhoneCodeDto, request: Request): Promise<import("./auth.service.js").AuthSession>;
    refresh(input: RefreshTokenDto, request: Request): Promise<import("./auth.service.js").AuthSession>;
    logout(user: AuthenticatedUser, input?: LogoutDto): Promise<void>;
    getMe(user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        email: null;
        roles: string[];
    }>;
    createTelegramLinkChallenge(user: AuthenticatedUser): Promise<import("./telegram-auth.service.js").TelegramChallenge>;
    linkTelegram(user: AuthenticatedUser, input: TelegramIdTokenDto): Promise<{
        message: string;
    }>;
    requestPhoneLinkCode(user: AuthenticatedUser, input: RequestPhoneCodeDto, request: Request): Promise<{
        message: string;
    }>;
    linkPhone(user: AuthenticatedUser, input: VerifyPhoneCodeDto): Promise<{
        message: string;
    }>;
    private requestMetadata;
}
