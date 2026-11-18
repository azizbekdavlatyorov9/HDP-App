var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RolesGuard_1;
import { Injectable } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { REQUIRED_ROLES } from '../decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard.js';
let RolesGuard = RolesGuard_1 = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(REQUIRED_ROLES, [context.getHandler(), context.getClass()]);
        if (!requiredRoles?.length)
            return true;
        const user = context
            .switchToHttp()
            .getRequest().user;
        if (!user) {
            const scopedGuards = [
                ...(Reflect.getMetadata(GUARDS_METADATA, context.getClass()) ?? []),
                ...(Reflect.getMetadata(GUARDS_METADATA, context.getHandler()) ?? []),
            ];
            if (scopedGuards.includes(JwtAuthGuard) &&
                scopedGuards.includes(RolesGuard_1))
                return true;
            return false;
        }
        return user.roles.some((role) => requiredRoles.includes(role));
    }
};
RolesGuard = RolesGuard_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], RolesGuard);
export { RolesGuard };
//# sourceMappingURL=roles.guard.js.map