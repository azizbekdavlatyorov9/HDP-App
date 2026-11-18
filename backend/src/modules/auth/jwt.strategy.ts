import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.js';

interface AccessTokenPayload {
  sub?: string;
  tokenUse?: string;
  iss?: string;
  aud?: string | string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      issuer: 'education-center-api',
      audience: 'education-center-mobile',
      algorithms: ['HS256'],
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    if (payload.tokenUse !== 'access' || typeof payload.sub !== 'string') {
      throw new UnauthorizedException('Invalid access token.');
    }
    return this.users.getAuthenticatedUser(payload.sub);
  }
}
