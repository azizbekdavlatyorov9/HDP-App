import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { PhoneAuthService } from './phone-auth.service.js';
import { TelegramAuthService } from './telegram-auth.service.js';
import { TelegramIdTokenDto } from './dto/telegram-id-token.dto.js';
import {
  RequestPhoneCodeDto,
  VerifyPhoneCodeDto,
} from './dto/phone-auth.dto.js';
import { LogoutDto, RefreshTokenDto } from './dto/refresh-token.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly telegram: TelegramAuthService,
    private readonly phone: PhoneAuthService,
  ) {}

  @Post('telegram/challenge')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Create a short-lived, single-use Telegram OIDC login challenge.' })
  @ApiOkResponse({ description: 'Returns the OIDC nonce and its expiration time.' })
  @ApiBadRequestResponse({ description: 'The request is invalid.' })
  createTelegramChallenge() {
    return this.telegram.createLoginChallenge();
  }

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register or sign in with a verified Telegram OIDC ID token.' })
  @ApiOkResponse({ description: 'Returns the user profile, access token, and refresh token.' })
  @ApiBadRequestResponse({ description: 'The ID token request body is invalid.' })
  @ApiUnauthorizedResponse({ description: 'The token or one-time challenge is invalid or expired.' })
  loginWithTelegram(
    @Body() input: TelegramIdTokenDto,
    @Req() request: Request,
  ) {
    return this.auth.loginWithTelegram(
      input.idToken,
      this.requestMetadata(request),
    );
  }

  @Post('phone/request-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  requestPhoneCode(
    @Body() input: RequestPhoneCodeDto,
    @Req() request: Request,
  ) {
    return this.phone.requestLoginCode(
      input.phoneNumber,
      this.requestMetadata(request),
    );
  }

  @Post('phone/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyPhoneCode(@Body() input: VerifyPhoneCodeDto, @Req() request: Request) {
    return this.auth.loginWithPhone(
      input.phoneNumber,
      input.code,
      this.requestMetadata(request),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  refresh(@Body() input: RefreshTokenDto, @Req() request: Request) {
    return this.auth.refresh(input.refreshToken, this.requestMetadata(request));
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input?: LogoutDto,
  ): Promise<void> {
    await this.auth.logout(user.id, input?.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getMe(user);
  }

  @Post('link/telegram/challenge')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Create an authenticated, single-use Telegram account-link challenge.' })
  @ApiOkResponse({ description: 'Returns the OIDC nonce and its expiration time.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  createTelegramLinkChallenge(@CurrentUser() user: AuthenticatedUser) {
    return this.telegram.createLinkChallenge(user.id);
  }

  @Post('link/telegram')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Link a verified Telegram identity to the authenticated account.' })
  @ApiOkResponse({ description: 'Telegram identity linked.' })
  @ApiBadRequestResponse({ description: 'The ID token request body is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication, token, or one-time challenge is invalid.' })
  @ApiConflictResponse({ description: 'The Telegram identity is already linked to another account.' })
  async linkTelegram(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: TelegramIdTokenDto,
  ) {
    await this.telegram.link(user.id, input.idToken);
    return { message: 'Telegram identity linked.' };
  }

  @Post('link/phone/request-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  requestPhoneLinkCode(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: RequestPhoneCodeDto,
    @Req() request: Request,
  ) {
    return this.phone.requestLinkCode(
      input.phoneNumber,
      user.id,
      this.requestMetadata(request),
    );
  }

  @Post('link/phone/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async linkPhone(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: VerifyPhoneCodeDto,
  ) {
    await this.phone.verifyLinkCode(input.phoneNumber, input.code, user.id);
    return { message: 'Phone identity linked.' };
  }

  private requestMetadata(request: Request) {
    const userAgent = request.headers['user-agent'];
    return {
      ipAddress: request.ip,
      userAgent:
        typeof userAgent === 'string' ? userAgent.slice(0, 1000) : undefined,
    };
  }
}
