import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createRemoteJWKSet } from 'jose';
import { URL } from 'node:url';
import {
  AuthChallenge,
  AuthIdentity,
  PhoneVerification,
  RefreshToken,
  Role,
  User,
  UserRole,
} from '../../database/entities/core.entity.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { IdentityService } from './identity.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtStrategy } from './jwt.strategy.js';
import { PhoneAuthService } from './phone-auth.service.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { SmsProvider, UnconfiguredSmsProvider } from './sms-provider.js';
import {
  TELEGRAM_ISSUER,
  TELEGRAM_JWKS_RESOLVER,
  TelegramIdTokenVerifier,
} from './telegram-id-token-verifier.js';
import { TelegramAuthService } from './telegram-auth.service.js';
import { TelegramOidcProbeController } from './telegram-oidc-probe.controller.js';
import { TelegramOidcProbeService } from './telegram-oidc-probe.service.js';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      AuthChallenge,
      AuthIdentity,
      PhoneVerification,
      RefreshToken,
      Role,
      User,
      UserRole,
    ]),
  ],
  controllers: [AuthController, TelegramOidcProbeController],
  providers: [
    AuthService,
    IdentityService,
    JwtAuthGuard,
    JwtStrategy,
    PhoneAuthService,
    RefreshTokenService,
    TelegramAuthService,
    TelegramOidcProbeService,
    TelegramIdTokenVerifier,
    { provide: SmsProvider, useClass: UnconfiguredSmsProvider },
    {
      provide: TELEGRAM_JWKS_RESOLVER,
      useFactory: () =>
        createRemoteJWKSet(new URL(`${TELEGRAM_ISSUER}/.well-known/jwks.json`)),
    },
  ],
  exports: [AuthService, IdentityService],
})
export class AuthModule {}
