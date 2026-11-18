import { RolesGuard } from './roles.guard.js';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard.js';

describe('RolesGuard', () => {
  function context(roles: string[] | undefined, handler = {}, controller = {}) {
    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => (roles ? { user: { roles } } : {}),
      }),
    } as never;
  }

  it('allows a user with one of the required roles', () => {
    const reflector = { getAllAndOverride: () => ['ADMIN', 'SUPER_ADMIN'] };
    expect(
      new RolesGuard(reflector as never).canActivate(
        context(['STUDENT', 'ADMIN']),
      ),
    ).toBe(true);
  });

  it('denies a user without a required role', () => {
    const reflector = { getAllAndOverride: () => ['ADMIN'] };
    expect(
      new RolesGuard(reflector as never).canActivate(context(['STUDENT'])),
    ).toBe(false);
  });

  it('allows routes with no role metadata', () => {
    const reflector = { getAllAndOverride: () => undefined };
    expect(new RolesGuard(reflector as never).canActivate(context([]))).toBe(
      true,
    );
  });

  it('defers global authorization only when JWT authentication and a scoped role guard are configured', () => {
    const handler = () => undefined;
    Reflect.defineMetadata(
      GUARDS_METADATA,
      [JwtAuthGuard, RolesGuard],
      handler,
    );
    const reflector = { getAllAndOverride: () => ['ADMIN'] };
    expect(
      new RolesGuard(reflector as never).canActivate(
        context(undefined, handler),
      ),
    ).toBe(true);
    expect(
      new RolesGuard(reflector as never).canActivate(context(undefined)),
    ).toBe(false);
  });
});
