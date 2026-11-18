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
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AttendanceBulkDto, AttendanceListDto, AttendanceUpdateDto, ReopenAttendanceDto } from './attendance.dto.js';
import { AttendanceService } from './attendance.service.js';
let TeacherAttendanceController = class TeacherAttendanceController {
    service;
    constructor(service) {
        this.service = service;
    }
    view(id, u) { return this.service.viewSession(id, u); }
    eligible(id, u) { return this.service.eligibleStudents(id, u); }
    start(id, u) { return this.service.start(id, u); }
    submit(id, d, u) { return this.service.submit(id, d, u); }
    update(id, aid, d, u) { return this.service.update(id, aid, d, u); }
    finalize(id, u) { return this.service.finalize(id, u); }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'View attendance state and records for an assigned session' }),
    __param(0, Param('sessionId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherAttendanceController.prototype, "view", null);
__decorate([
    Get('eligible'),
    __param(0, Param('sessionId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherAttendanceController.prototype, "eligible", null);
__decorate([
    Post('start'),
    __param(0, Param('sessionId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherAttendanceController.prototype, "start", null);
__decorate([
    Put(),
    __param(0, Param('sessionId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AttendanceBulkDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAttendanceController.prototype, "submit", null);
__decorate([
    Patch(':attendanceId'),
    __param(0, Param('sessionId')),
    __param(1, Param('attendanceId')),
    __param(2, Body()),
    __param(3, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, AttendanceUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAttendanceController.prototype, "update", null);
__decorate([
    Post('finalize'),
    __param(0, Param('sessionId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherAttendanceController.prototype, "finalize", null);
TeacherAttendanceController = __decorate([
    ApiTags('Teacher attendance'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
    Controller('teachers/me/sessions/:sessionId/attendance'),
    __metadata("design:paramtypes", [AttendanceService])
], TeacherAttendanceController);
export { TeacherAttendanceController };
let StudentAttendanceController = class StudentAttendanceController {
    service;
    constructor(service) {
        this.service = service;
    }
    statistics(u, q) { return this.service.statistics(u, undefined, q); }
    list(u, q) { return this.service.studentList(u, q); }
    detail(id, u) { return this.service.studentDetail(id, u); }
};
__decorate([
    Get('statistics'),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AttendanceListDto]),
    __metadata("design:returntype", void 0)
], StudentAttendanceController.prototype, "statistics", null);
__decorate([
    Get(),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AttendanceListDto]),
    __metadata("design:returntype", void 0)
], StudentAttendanceController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StudentAttendanceController.prototype, "detail", null);
StudentAttendanceController = __decorate([
    ApiTags('Student attendance'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('STUDENT'),
    Controller('students/me/attendance'),
    __metadata("design:paramtypes", [AttendanceService])
], StudentAttendanceController);
export { StudentAttendanceController };
let AdminAttendanceController = class AdminAttendanceController {
    service;
    constructor(service) {
        this.service = service;
    }
    statistics(q, u) { return this.service.adminStatistics(q, u); }
    session(id, u) { return this.service.viewSession(id, u); }
    list(q, u) { return this.service.adminList(q, u); }
    update(id, d, u) { return this.service.adminUpdate(id, d, u); }
    reopen(id, d, u) { return this.service.reopen(id, d.reason, u); }
};
__decorate([
    Get('statistics'),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AttendanceListDto, Object]),
    __metadata("design:returntype", void 0)
], AdminAttendanceController.prototype, "statistics", null);
__decorate([
    Get('sessions/:sessionId'),
    __param(0, Param('sessionId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminAttendanceController.prototype, "session", null);
__decorate([
    Get(),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AttendanceListDto, Object]),
    __metadata("design:returntype", void 0)
], AdminAttendanceController.prototype, "list", null);
__decorate([
    Patch(':attendanceId'),
    __param(0, Param('attendanceId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AttendanceUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], AdminAttendanceController.prototype, "update", null);
__decorate([
    Post('sessions/:sessionId/reopen'),
    __param(0, Param('sessionId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReopenAttendanceDto, Object]),
    __metadata("design:returntype", void 0)
], AdminAttendanceController.prototype, "reopen", null);
AdminAttendanceController = __decorate([
    ApiTags('Administrative attendance'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/attendance'),
    __metadata("design:paramtypes", [AttendanceService])
], AdminAttendanceController);
export { AdminAttendanceController };
//# sourceMappingURL=attendance.controller.js.map