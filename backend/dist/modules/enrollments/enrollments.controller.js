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
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { EnrollmentStatusDto, ManualEnrollmentDto } from './enrollments.dto.js';
import { EnrollmentsService } from './enrollments.service.js';
let EnrollmentsController = class EnrollmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    mine(user) {
        return this.service.mine(user);
    }
    detail(id, user) {
        return this.service.detail(id, user);
    }
};
__decorate([
    Get('my'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "mine", null);
__decorate([
    Get(':id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "detail", null);
EnrollmentsController = __decorate([
    ApiTags('Enrollments'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('enrollments'),
    __metadata("design:paramtypes", [EnrollmentsService])
], EnrollmentsController);
export { EnrollmentsController };
let AdminEnrollmentsController = class AdminEnrollmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    manual(dto, user) {
        return this.service.manual(dto, user);
    }
    list(user) {
        return this.service.adminList(user);
    }
    detail(id, user) {
        return this.service.detail(id, user);
    }
    status(id, dto, user) {
        return this.service.setStatus(id, dto.status, user);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ManualEnrollmentDto, Object]),
    __metadata("design:returntype", void 0)
], AdminEnrollmentsController.prototype, "manual", null);
__decorate([
    Get(),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminEnrollmentsController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminEnrollmentsController.prototype, "detail", null);
__decorate([
    Patch(':id/status'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, EnrollmentStatusDto, Object]),
    __metadata("design:returntype", void 0)
], AdminEnrollmentsController.prototype, "status", null);
AdminEnrollmentsController = __decorate([
    ApiTags('Admin enrollments'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/enrollments'),
    __metadata("design:paramtypes", [EnrollmentsService])
], AdminEnrollmentsController);
export { AdminEnrollmentsController };
//# sourceMappingURL=enrollments.controller.js.map