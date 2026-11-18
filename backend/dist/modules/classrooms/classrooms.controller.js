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
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ClassroomCreateDto, ClassroomStatusDto, ClassroomUpdateDto } from './classrooms.dto.js';
import { ClassroomsService } from './classrooms.service.js';
let ClassroomsController = class ClassroomsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d, u) { return this.service.create(d, u); }
    list(inactive, u) { return this.service.list(inactive === 'true', u); }
    get(id) { return this.service.get(id); }
    update(id, d, u) { return this.service.update(id, d, u); }
    status(id, d, u) { return this.service.setActive(id, d.isActive, u); }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Create a classroom (administrators only)' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ClassroomCreateDto, Object]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "create", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'List active classrooms' }),
    __param(0, Query('includeInactive')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "get", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ClassroomUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "update", null);
__decorate([
    Patch(':id/status'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ClassroomStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "status", null);
ClassroomsController = __decorate([
    ApiTags('Classrooms'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('classrooms'),
    __metadata("design:paramtypes", [ClassroomsService])
], ClassroomsController);
export { ClassroomsController };
//# sourceMappingURL=classrooms.controller.js.map