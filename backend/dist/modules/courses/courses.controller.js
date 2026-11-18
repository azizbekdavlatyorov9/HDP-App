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
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateCourseDto, ListCoursesDto, UpdateCourseDto, } from './courses.dto.js';
import { CoursesService } from './courses.service.js';
let CoursesController = class CoursesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(query) {
        return this.service.list(query);
    }
    details(id) {
        return this.service.details(id);
    }
    create(dto, user) {
        return this.service.create(dto, user);
    }
    update(id, dto, user) {
        return this.service.update(id, dto, user);
    }
    remove(id, user) {
        return this.service.remove(id, user);
    }
    publish(id, user) {
        return this.service.setStatus(id, 'published', user);
    }
    archive(id, user) {
        return this.service.setStatus(id, 'archived', user);
    }
    assignTeacher(id, teacherId, user) {
        return this.service.assignTeacher(id, teacherId, user);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List published courses' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListCoursesDto]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "list", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get published course details' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "details", null);
__decorate([
    Post(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a course' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCourseDto, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "create", null);
__decorate([
    Patch(':id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update a course' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCourseDto, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Deactivate a course without deleting dependent records',
    }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "remove", null);
__decorate([
    Post(':id/publish'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Publish a course' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "publish", null);
__decorate([
    Post(':id/archive'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Archive a course' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "archive", null);
__decorate([
    Patch(':id/lead-teacher'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Assign a lead teacher (administrators only)' }),
    __param(0, Param('id')),
    __param(1, Body('teacherId')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "assignTeacher", null);
CoursesController = __decorate([
    ApiTags('Courses'),
    Controller('courses'),
    __metadata("design:paramtypes", [CoursesService])
], CoursesController);
export { CoursesController };
let CategoriesController = class CategoriesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list() {
        return this.service.listCategories();
    }
    courses(id, query) {
        return this.service.categoryCourses(id, query);
    }
    create(dto, user) {
        return this.service.createCategory(dto, user);
    }
    update(id, dto, user) {
        return this.service.updateCategory(id, dto, user);
    }
    archive(id, user) {
        return this.service.archiveCategory(id, user);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List active categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "list", null);
__decorate([
    Get(':id/courses'),
    ApiOperation({ summary: 'List published courses in a category' }),
    __param(0, Param('id')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ListCoursesDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "courses", null);
__decorate([
    Post(),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a category (administrators only)' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "create", null);
__decorate([
    Patch(':id'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update a category (administrators only)' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "update", null);
__decorate([
    Post(':id/archive'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Archive a category (administrators only)' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "archive", null);
CategoriesController = __decorate([
    ApiTags('Categories'),
    Controller('categories'),
    __metadata("design:paramtypes", [CoursesService])
], CategoriesController);
export { CategoriesController };
//# sourceMappingURL=courses.controller.js.map