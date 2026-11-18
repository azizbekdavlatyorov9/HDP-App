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
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateLessonDto, CreateSubjectLessonDto, ReorderLessonsDto, UpdateLessonDto, } from './lessons.dto.js';
import { LessonsService } from './lessons.service.js';
let LessonsController = class LessonsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(courseId, dto, user) {
        return this.service.create(courseId, dto, user);
    }
    list(courseId, user) {
        return this.service.list(courseId, user);
    }
    reorder(courseId, dto, user) {
        return this.service.reorder(courseId, dto.lessonIds, user);
    }
    listForSubject(subjectId) {
        return this.service.publicListForSubject(subjectId);
    }
    createForSubject(subjectId, dto, user) {
        return this.service.createForSubject(subjectId, dto, user);
    }
    publicDetail(id) {
        return this.service.publicDetail(id);
    }
    detail(id, user) {
        return this.service.detail(id, user);
    }
    update(id, dto, user) {
        return this.service.update(id, dto, user);
    }
    publish(id, user) {
        return this.service.publish(id, user);
    }
    archive(id, user) {
        return this.service.archive(id, user);
    }
    archiveLegacy(id, user) {
        return this.service.archive(id, user);
    }
};
__decorate([
    Post('courses/:courseId/lessons'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a draft lesson in a managed course' }),
    __param(0, Param('courseId', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateLessonDto, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "create", null);
__decorate([
    Get('courses/:courseId/lessons'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'List published lessons with learner lock state' }),
    __param(0, Param('courseId', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "list", null);
__decorate([
    Post('courses/:courseId/lessons/reorder'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    __param(0, Param('courseId', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReorderLessonsDto, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "reorder", null);
__decorate([
    Get('subjects/:subjectId/lessons'),
    ApiOperation({
        summary: 'Public list of published lessons for an active subject',
    }),
    __param(0, Param('subjectId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "listForSubject", null);
__decorate([
    Post('subjects/:subjectId/lessons'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    __param(0, Param('subjectId', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateSubjectLessonDto, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "createForSubject", null);
__decorate([
    Get('lessons/:id'),
    ApiOperation({ summary: 'Public details for a published lesson' }),
    __param(0, Param('id', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "publicDetail", null);
__decorate([
    Get('lessons/:id/access'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "detail", null);
__decorate([
    Patch('lessons/:id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateLessonDto, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "update", null);
__decorate([
    Post('lessons/:id/publish'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "publish", null);
__decorate([
    Delete('lessons/:id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "archive", null);
__decorate([
    Post('lessons/:id/archive'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "archiveLegacy", null);
LessonsController = __decorate([
    ApiTags('Lessons'),
    Controller(),
    __metadata("design:paramtypes", [LessonsService])
], LessonsController);
export { LessonsController };
//# sourceMappingURL=lessons.controller.js.map