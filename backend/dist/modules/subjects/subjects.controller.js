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
import { CreateSubjectDto, UpdateSubjectDto } from './subjects.dto.js';
import { SubjectsService } from './subjects.service.js';
let CourseSubjectsController = class CourseSubjectsController {
    subjects;
    constructor(subjects) {
        this.subjects = subjects;
    }
    list(courseId) {
        return this.subjects.listForCourse(courseId);
    }
    create(courseId, dto, user) {
        return this.subjects.create(courseId, dto, user);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List active subjects of a published course' }),
    __param(0, Param('courseId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseSubjectsController.prototype, "list", null);
__decorate([
    Post(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a subject for a course' }),
    __param(0, Param('courseId', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateSubjectDto, Object]),
    __metadata("design:returntype", void 0)
], CourseSubjectsController.prototype, "create", null);
CourseSubjectsController = __decorate([
    ApiTags('Subjects'),
    Controller('courses/:courseId/subjects'),
    __metadata("design:paramtypes", [SubjectsService])
], CourseSubjectsController);
export { CourseSubjectsController };
let SubjectsController = class SubjectsController {
    subjects;
    constructor(subjects) {
        this.subjects = subjects;
    }
    get(id) {
        return this.subjects.get(id);
    }
    update(id, dto, user) {
        return this.subjects.update(id, dto, user);
    }
    archive(id, user) {
        return this.subjects.archive(id, user);
    }
};
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get an active subject' }),
    __param(0, Param('id', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "get", null);
__decorate([
    Patch(':id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update a subject' }),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateSubjectDto, Object]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Archive a subject without deleting its record' }),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "archive", null);
SubjectsController = __decorate([
    ApiTags('Subjects'),
    Controller('subjects'),
    __metadata("design:paramtypes", [SubjectsService])
], SubjectsController);
export { SubjectsController };
//# sourceMappingURL=subjects.controller.js.map