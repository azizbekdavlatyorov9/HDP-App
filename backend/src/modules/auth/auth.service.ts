import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/core.entity.js';
import { UserProfileDto } from '../users/dto/user-profile.dto.js';
import { UsersService } from '../users/users.service.js';
import type {
  AuthenticatedUser,
  RequestMetadata,
} from './interfaces/authenticated-user.js';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly telegramAuth: TelegramAuthService,
    private readonly phoneAuth: PhoneAuthService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  async loginWithTelegram(
    idToken: string,
    metadata: RequestMetadata,
  ): Promise<AuthSession> {
    const user = await this.telegramAuth.authenticate(idToken);
    return this.createSession(user, metadata);
  }

  async loginWithPhone(
    phoneNumber: string,
    code: string,
    metadata: RequestMetadata,
  ): Promise<AuthSession> {
    const user = await this.phoneAuth.verifyLoginCode(phoneNumber, code);
    return this.createSession(user, metadata);
  }

  async refresh(
    refreshToken: string,
    metadata: RequestMetadata,
  ): Promise<AuthSession> {
    const rotated = await this.refreshTokens.rotate(refreshToken, metadata);
    return this.toSession(rotated.user, rotated.refreshToken);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    await this.refreshTokens.revoke(userId, refreshToken);
  }

  async getMe(user: AuthenticatedUser): Promise<{
    id: string;
    name: string;
    email: null;
    roles: string[];
  }> {
    const profile = await this.users.getProfile(user.id);
    return {
      id: profile.id,
      name: profile.displayName,
      // User has no email column or email identity provider in the current schema.
      email: null,
      roles: profile.roles,
    };
  }

  private async createSession(
    user: User,
    metadata: RequestMetadata,
  ): Promise<AuthSession> {
    const refreshToken = await this.refreshTokens.create(user, metadata);
    return this.toSession(user, refreshToken);
  }

  private async toSession(
    user: User,
    refreshToken: string,
  ): Promise<AuthSession> {
    const secret = this.config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException(
        'Authentication is temporarily unavailable.',
      );
    }

    const accessToken = await this.jwt.signAsync(
      { tokenUse: 'access' },
      {
        secret,
        subject: user.id,
        issuer: 'education-center-api',
        audience: 'education-center-mobile',
        expiresIn: '15m',
      },
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: await this.users.getProfile(user.id),
    };
  }
}
