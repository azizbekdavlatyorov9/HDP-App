import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { REQUIRED_ROLES } from '../decorators/roles.decorator.js';
import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.js';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) return true;

    const user = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>().user;

    if (!user) {
      // Global guards run before controller/method guards. Defer role evaluation
      // only when this route explicitly runs JWT authentication followed by this
      // guard; otherwise an unguarded role-decorated route must fail closed.
      const scopedGuards = [
        ...(Reflect.getMetadata(GUARDS_METADATA, context.getClass()) ?? []),
        ...(Reflect.getMetadata(GUARDS_METADATA, context.getHandler()) ?? []),
      ] as unknown[];
      if (
        scopedGuards.includes(JwtAuthGuard) &&
        scopedGuards.includes(RolesGuard)
      )
        return true;
      return false;
    }

    return user.roles.some((role) => requiredRoles.includes(role));
  }
}
