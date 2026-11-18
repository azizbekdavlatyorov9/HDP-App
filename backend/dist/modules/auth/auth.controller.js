var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { PhoneAuthService } from './phone-auth.service.js';
import { TelegramAuthService } from './telegram-auth.service.js';
import { TelegramIdTokenDto } from './dto/telegram-id-token.dto.js';
import { RequestPhoneCodeDto, VerifyPhoneCodeDto, } from './dto/phone-auth.dto.js';
import { LogoutDto, RefreshTokenDto } from './dto/refresh-token.dto.js';
let AuthController = class AuthController {
    auth;
    telegram;
    phone;
    constructor(auth, telegram, phone) {
        this.auth = auth;
        this.telegram = telegram;
        this.phone = phone;
    }
    createTelegramChallenge() {
        return this.telegram.createLoginChallenge();
    }
    loginWithTelegram(input, request) {
        return this.auth.loginWithTelegram(input.idToken, this.requestMetadata(request));
    }
    requestPhoneCode(input, request) {
        return this.phone.requestLoginCode(input.phoneNumber, this.requestMetadata(request));
    }
    verifyPhoneCode(input, request) {
        return this.auth.loginWithPhone(input.phoneNumber, input.code, this.requestMetadata(request));
    }
    refresh(input, request) {
        return this.auth.refresh(input.refreshToken, this.requestMetadata(request));
    }
    async logout(user, input) {
        await this.auth.logout(user.id, input?.refreshToken);
    }
    getMe(user) {
        return this.auth.getMe(user);
    }
    createTelegramLinkChallenge(user) {
        return this.telegram.createLinkChallenge(user.id);
    }
    async linkTelegram(user, input) {
        await this.telegram.link(user.id, input.idToken);
        return { message: 'Telegram identity linked.' };
    }
    requestPhoneLinkCode(user, input, request) {
        return this.phone.requestLinkCode(input.phoneNumber, user.id, this.requestMetadata(request));
    }
    async linkPhone(user, input) {
        await this.phone.verifyLinkCode(input.phoneNumber, input.code, user.id);
        return { message: 'Phone identity linked.' };
    }
    requestMetadata(request) {
        const userAgent = request.headers['user-agent'];
        return {
            ipAddress: request.ip,
            userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 1000) : undefined,
        };
    }
};
__decorate([
    Post('telegram/challenge'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    ApiOperation({ summary: 'Create a short-lived, single-use Telegram OIDC login challenge.' }),
    ApiOkResponse({ description: 'Returns the OIDC nonce and its expiration time.' }),
    ApiBadRequestResponse({ description: 'The request is invalid.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "createTelegramChallenge", null);
__decorate([
    Post('telegram'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    ApiOperation({ summary: 'Register or sign in with a verified Telegram OIDC ID token.' }),
    ApiOkResponse({ description: 'Returns the user profile, access token, and refresh token.' }),
    ApiBadRequestResponse({ description: 'The ID token request body is invalid.' }),
    ApiUnauthorizedResponse({ description: 'The token or one-time challenge is invalid or expired.' }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TelegramIdTokenDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginWithTelegram", null);
__decorate([
    Post('phone/request-code'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 3, ttl: 60_000 } }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestPhoneCodeDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "requestPhoneCode", null);
__decorate([
    Post('phone/verify'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyPhoneCodeDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyPhoneCode", null);
__decorate([
    Post('refresh'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 20, ttl: 60_000 } }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    Post('logout'),
    HttpCode(HttpStatus.NO_CONTENT),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, LogoutDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    Get('me'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    Post('link/telegram/challenge'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    ApiOperation({ summary: 'Create an authenticated, single-use Telegram account-link challenge.' }),
    ApiOkResponse({ description: 'Returns the OIDC nonce and its expiration time.' }),
    ApiUnauthorizedResponse({ description: 'Authentication is required.' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "createTelegramLinkChallenge", null);
__decorate([
    Post('link/telegram'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    ApiOperation({ summary: 'Link a verified Telegram identity to the authenticated account.' }),
    ApiOkResponse({ description: 'Telegram identity linked.' }),
    ApiBadRequestResponse({ description: 'The ID token request body is invalid.' }),
    ApiUnauthorizedResponse({ description: 'Authentication, token, or one-time challenge is invalid.' }),
    ApiConflictResponse({ description: 'The Telegram identity is already linked to another account.' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, TelegramIdTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "linkTelegram", null);
__decorate([
    Post('link/phone/request-code'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    Throttle({ default: { limit: 3, ttl: 60_000 } }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RequestPhoneCodeDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "requestPhoneLinkCode", null);
__decorate([
    Post('link/phone/verify'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, VerifyPhoneCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "linkPhone", null);
AuthController = __decorate([
    ApiTags('auth'),
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService,
        TelegramAuthService,
        PhoneAuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map