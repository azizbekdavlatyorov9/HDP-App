import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify } from 'jose';
import type { JWTVerifyGetKey } from 'jose';

export const TELEGRAM_JWKS_RESOLVER = Symbol('TELEGRAM_JWKS_RESOLVER');
export const TELEGRAM_ISSUER = 'https://oauth.telegram.org';

export interface VerifiedTelegramIdentity {
  subject: string;
  nonce: string;
  issuedAt: number;
  displayName: string | null;
}

@Injectable()
export class TelegramIdTokenVerifier {
  constructor(
    private readonly config: ConfigService,
    @Inject(TELEGRAM_JWKS_RESOLVER)
    private readonly jwksResolver: JWTVerifyGetKey,
  ) {}

  async verify(idToken: string): Promise<VerifiedTelegramIdentity> {
    const clientId = this.config.get<string>('TELEGRAM_CLIENT_ID');
    if (!clientId) {
      throw new ServiceUnavailableException(
        'Telegram authentication is not configured.',
      );
    }

    try {
      const { payload } = await jwtVerify(idToken, this.jwksResolver, {
        issuer: TELEGRAM_ISSUER,
        audience: clientId,
        algorithms: ['RS256'],
        requiredClaims: ['sub', 'iat', 'exp', 'iss', 'aud', 'nonce'],
        maxTokenAge: '5m',
      });

      if (
        typeof payload.sub !== 'string' ||
        payload.sub.length === 0 ||
        typeof payload.nonce !== 'string' ||
        typeof payload.iat !== 'number'
      ) {
        throw new Error('Required OIDC claims are missing.');
      }

      const name = payload.name;
      return {
        subject: payload.sub,
        nonce: payload.nonce,
        issuedAt: payload.iat,
        displayName:
          typeof name === 'string' && name.trim()
            ? name.trim().slice(0, 100)
            : null,
      };
    } catch {
      throw new UnauthorizedException('Invalid Telegram identity token.');
    }
  }
}
