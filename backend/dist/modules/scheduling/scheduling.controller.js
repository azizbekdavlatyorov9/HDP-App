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
import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GroupListDto } from '../groups/groups.dto.js';
import { ReplaceGroupScheduleDto } from './group-schedule.dto.js';
import { CancelSessionDto, GenerateSessionsDto, RescheduleSessionDto, ScheduleCreateDto, ScheduleStatusDto, ScheduleUpdateDto, SessionStatusDto } from './scheduling.dto.js';
import { SchedulingService } from './scheduling.service.js';
let SchedulingController = class SchedulingController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d, u) { return this.service.create(d, u); }
    list(u, groupId) { return this.service.list(u, groupId); }
    get(id, u) { return this.service.getSchedule(id, u); }
    update(id, d, u) { return this.service.update(id, d, u); }
    status(id, d, u) { return this.service.setStatus(id, d.isActive, u); }
    generate(id, d, u) { return this.service.generate(id, d, u); }
};
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ScheduleCreateDto, Object]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, CurrentUser()),
    __param(1, Query('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "get", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ScheduleUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "update", null);
__decorate([
    Patch(':id/status'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ScheduleStatusDto, Object]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "status", null);
__decorate([
    Post(':id/generate-sessions'),
    ApiOperation({ summary: 'Generate timezone-aware sessions in an inclusive date range, up to one year' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, GenerateSessionsDto, Object]),
    __metadata("design:returntype", void 0)
], SchedulingController.prototype, "generate", null);
SchedulingController = __decorate([
    ApiTags('Schedules'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('schedules'),
    __metadata("design:paramtypes", [SchedulingService])
], SchedulingController);
export { SchedulingController };
let SessionsController = class SessionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(u, q, groupId) { return this.service.listSessions(u, groupId, q.page, q.limit); }
    get(id, u) { return this.service.getSession(id, u); }
    reschedule(id, d, u) { return this.service.reschedule(id, d, u); }
    cancel(id, d, u) { return this.service.cancelSession(id, d.note, u); }
    status(id, d, u) { return this.service.setSessionStatus(id, d.status, u); }
};
__decorate([
    Get(),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __param(2, Query('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, GroupListDto, String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "get", null);
__decorate([
    Patch(':id/reschedule'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RescheduleSessionDto, Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "reschedule", null);
__decorate([
    Patch(':id/cancel'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CancelSessionDto, Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "cancel", null);
__decorate([
    Patch(':id/status'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SessionStatusDto, Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "status", null);
SessionsController = __decorate([
    ApiTags('Lesson sessions'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('sessions'),
    __metadata("design:paramtypes", [SchedulingService])
], SessionsController);
export { SessionsController };
let StudentSessionsController = class StudentSessionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(u, q) { return this.service.listSessions(u, undefined, q.page, q.limit); }
};
__decorate([
    Get(),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, GroupListDto]),
    __metadata("design:returntype", void 0)
], StudentSessionsController.prototype, "list", null);
StudentSessionsController = __decorate([
    ApiTags('Personal lesson sessions'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('students/me/sessions'),
    __metadata("design:paramtypes", [SchedulingService])
], StudentSessionsController);
export { StudentSessionsController };
let TeacherSessionsController = class TeacherSessionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(u, q) { return this.service.listSessions(u, undefined, q.page, q.limit); }
};
__decorate([
    Get(),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, GroupListDto]),
    __metadata("design:returntype", void 0)
], TeacherSessionsController.prototype, "list", null);
TeacherSessionsController = __decorate([
    ApiTags('Personal lesson sessions'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('teachers/me/sessions'),
    __metadata("design:paramtypes", [SchedulingService])
], TeacherSessionsController);
export { TeacherSessionsController };
let GroupSchedulesController = class GroupSchedulesController {
    service;
    constructor(service) {
        this.service = service;
    }
    async get(groupId, u) { return (await this.service.listGroupSchedule(groupId, u)).map(s => ({ ...s, weekday: s.weekday === 0 ? 7 : s.weekday })); }
};
__decorate([
    Get(':groupId/schedule'),
    __param(0, Param('groupId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupSchedulesController.prototype, "get", null);
GroupSchedulesController = __decorate([
    ApiTags('Group schedules'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('groups'),
    __metadata("design:paramtypes", [SchedulingService])
], GroupSchedulesController);
export { GroupSchedulesController };
let AdminGroupSchedulesController = class AdminGroupSchedulesController {
    service;
    constructor(service) {
        this.service = service;
    }
    replace(groupId, dto, u) { return this.service.replaceGroupSchedules(groupId, dto.schedules, u); }
};
__decorate([
    Put(':groupId/schedule'),
    __param(0, Param('groupId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReplaceGroupScheduleDto, Object]),
    __metadata("design:returntype", void 0)
], AdminGroupSchedulesController.prototype, "replace", null);
AdminGroupSchedulesController = __decorate([
    ApiTags('Admin group schedules'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/groups'),
    __metadata("design:paramtypes", [SchedulingService])
], AdminGroupSchedulesController);
export { AdminGroupSchedulesController };
//# sourceMappingURL=scheduling.controller.js.map