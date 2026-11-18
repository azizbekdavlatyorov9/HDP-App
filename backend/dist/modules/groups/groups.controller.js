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
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AddEnrollmentToGroupDto, AddStudentDto, AssignGroupTeacherDto, GroupCreateDto, GroupListDto, GroupStatusDto, GroupUpdateDto, MembershipStatusDto, } from './groups.dto.js';
import { GroupsService } from './groups.service.js';
let GroupsController = class GroupsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d, u) {
        return this.service.create(d, u);
    }
    list(q, u) {
        return this.service.list(u, q);
    }
    me(u) { return this.service.studentGroups(u); }
    get(id, u) { return this.service.get(id, u); }
    update(id, d, u) { return this.service.update(id, d, u); }
    status(id, d, u) { return this.service.setStatus(id, d.status, u); }
    add(id, d, u) { return this.service.addStudent(id, d.studentId, u); }
    students(id, u) { return this.service.students(id, u); }
    history(id, u) { return this.service.history(id, u); }
    membershipStatus(id, mid, d, u) { return this.service.setMembershipStatus(id, mid, d.status, u); }
    remove(id, studentId, u) { return this.service.removeStudent(id, studentId, u); }
};
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GroupCreateDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "create", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'List groups visible to the authenticated user' }),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GroupListDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "list", null);
__decorate([
    Get('me'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "me", null);
__decorate([
    Get(':id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "get", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, GroupUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "update", null);
__decorate([
    Patch(':id/status'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, GroupStatusDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "status", null);
__decorate([
    Post(':id/students'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddStudentDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "add", null);
__decorate([
    Get(':id/students'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "students", null);
__decorate([
    Get(':id/memberships'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "history", null);
__decorate([
    Patch(':id/memberships/:membershipId'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Param('membershipId', ParseUUIDPipe)),
    __param(2, Body()),
    __param(3, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, MembershipStatusDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "membershipStatus", null);
__decorate([
    Delete(':id/students/:studentId'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Param('studentId', ParseUUIDPipe)),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "remove", null);
GroupsController = __decorate([
    ApiTags('Study groups'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('groups'),
    __metadata("design:paramtypes", [GroupsService])
], GroupsController);
export { GroupsController };
let AdminGroupsController = class AdminGroupsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d, u) { return this.service.create(d, u); }
    update(id, d, u) { return this.service.update(id, d, u); }
    archive(id, u) { return this.service.archive(id, u); }
    teacher(id, d, u) { return this.service.update(id, { teacherId: d.teacherId }, u); }
    addStudent(id, d, u) { return this.service.addEnrollment(id, d.enrollmentId, u); }
    removeStudent(id, enrollmentId, u) { return this.service.removeEnrollment(id, enrollmentId, u); }
};
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GroupCreateDto, Object]),
    __metadata("design:returntype", void 0)
], AdminGroupsController.prototype, "create", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, GroupUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], AdminGroupsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminGroupsController.prototype, "archive", null);
__decorate([
    Patch(':id/teacher'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignGroupTeacherDto, Object]),
    __metadata("design:returntype", void 0)
], AdminGroupsController.prototype, "teacher", null);
__decorate([
    Post(':id/students'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddEnrollmentToGroupDto, Object]),
    __metadata("design:returntype", void 0)
], AdminGroupsController.prototype, "addStudent", null);
__decorate([
    Delete(':id/students/:enrollmentId'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Param('enrollmentId', ParseUUIDPipe)),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AdminGroupsController.prototype, "removeStudent", null);
AdminGroupsController = __decorate([
    ApiTags('Admin study groups'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/groups'),
    __metadata("design:paramtypes", [GroupsService])
], AdminGroupsController);
export { AdminGroupsController };
let TeacherGroupsController = class TeacherGroupsController {
    service;
    constructor(service) {
        this.service = service;
    }
    me(u) { return this.service.teacherGroups(u, u.id); }
    byTeacher(id, u) { return this.service.teacherGroups(u, id); }
};
__decorate([
    Get('me/groups'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeacherGroupsController.prototype, "me", null);
__decorate([
    Get(':teacherId/groups'),
    __param(0, Param('teacherId', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherGroupsController.prototype, "byTeacher", null);
TeacherGroupsController = __decorate([
    ApiTags('Teacher groups'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('teachers'),
    __metadata("design:paramtypes", [GroupsService])
], TeacherGroupsController);
export { TeacherGroupsController };
//# sourceMappingURL=groups.controller.js.map