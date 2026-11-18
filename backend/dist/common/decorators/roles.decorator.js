import { SetMetadata } from '@nestjs/common';
export const REQUIRED_ROLES = 'requiredRoles';
export const Roles = (...roles) => SetMetadata(REQUIRED_ROLES, roles);
//# sourceMappingURL=roles.decorator.js.map