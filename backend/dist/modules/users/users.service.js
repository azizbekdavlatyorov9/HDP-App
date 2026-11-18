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
import { Injectable, NotFoundException, UnauthorizedException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/core.entity.js';
let UsersService = class UsersService {
    users;
    constructor(users) {
        this.users = users;
    }
    async getAuthenticatedUser(userId) {
        const user = await this.users.findOne({
            where: { id: userId },
            relations: { userRoles: { role: true } },
        });
        if (!user || user.status !== 'active' || user.deletedAt) {
            throw new UnauthorizedException('Authentication is required.');
        }
        return {
            id: user.id,
            displayName: user.displayName,
            roles: user.userRoles.map((assignment) => assignment.role.code),
        };
    }
    async getProfile(userId) {
        const user = await this.users.findOne({
            where: { id: userId },
            relations: { userRoles: { role: true } },
        });
        if (!user || user.status !== 'active' || user.deletedAt) {
            throw new NotFoundException('User profile was not found.');
        }
        return this.toProfile(user);
    }
    async updateProfile(userId, input) {
        const user = await this.users.findOne({
            where: { id: userId },
            relations: { userRoles: { role: true } },
        });
        if (!user || user.status !== 'active' || user.deletedAt) {
            throw new NotFoundException('User profile was not found.');
        }
        user.displayName = input.displayName;
        await this.users.save(user);
        return this.toProfile(user);
    }
    toProfile(user) {
        return {
            id: user.id,
            displayName: user.displayName,
            status: user.status,
            roles: user.userRoles.map((assignment) => assignment.role.code),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map