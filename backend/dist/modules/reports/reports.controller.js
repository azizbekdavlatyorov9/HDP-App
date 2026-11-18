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
import { Controller, Get, Header, Param, ParseUUIDPipe, Query, Res, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DashboardQueryDto, ReportQueryDto } from './reports.dto.js';
import { ReportsService } from './reports.service.js';
let ReportsController = class ReportsController {
    reports;
    constructor(reports) {
        this.reports = reports;
    }
    dashboard(q) {
        return this.reports.dashboard(q);
    }
    studentStatistics(q) {
        return this.reports.studentStatistics(q);
    }
    async exportStudents(q, res) {
        res.setHeader('Content-Disposition', 'attachment; filename="students-report.csv"');
        res.send('\uFEFF' + (await this.reports.export('students', q)));
    }
    studentDetail(id) {
        return this.reports.studentDetail(id);
    }
    students(q) {
        return this.reports.studentList(q);
    }
    teacherStatistics() {
        return this.reports.teacherStatistics();
    }
    teacherDetail(id) {
        return this.reports.teacherDetail(id);
    }
    teachers(q) {
        return this.reports.teacherList(q);
    }
    courseDetail(id) {
        return this.reports.courseDetail(id);
    }
    courses(q) {
        return this.reports.courseList(q);
    }
    groupDetail(id) {
        return this.reports.groupDetail(id);
    }
    groups(q) {
        return this.reports.groupList(q);
    }
    async exportAttendance(q, res) {
        res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
        res.send('\uFEFF' + (await this.reports.export('attendance', q)));
    }
    attendance(q) {
        return this.reports.attendance(q);
    }
    financeOverview(q) {
        return this.reports.financeOverview(q);
    }
    async exportFinance(q, res) {
        res.setHeader('Content-Disposition', 'attachment; filename="payments-report.csv"');
        res.send('\uFEFF' + (await this.reports.export('finance', q)));
    }
    payments(q) {
        return this.reports.paymentList(q);
    }
    revenue(q) {
        return this.reports.revenueByPeriod(q);
    }
    providers(q) {
        return this.reports.providers(q);
    }
    courseRevenue(q) {
        return this.reports.courseRevenue(q);
    }
    async exportAssignments(q, res) {
        res.setHeader('Content-Disposition', 'attachment; filename="assignments-report.csv"');
        res.send('\uFEFF' + (await this.reports.export('assignments', q)));
    }
    assignments(q) {
        return this.reports.assignmentReports(q);
    }
    crmOverview(q) {
        return this.reports.crmOverview(q);
    }
    crmConversion(q) {
        return this.reports.crmConversion(q);
    }
    crmOperators(q) {
        return this.reports.crmOperators(q);
    }
    async exportLeads(q, res) {
        res.setHeader('Content-Disposition', 'attachment; filename="crm-leads-report.csv"');
        res.send('\uFEFF' + (await this.reports.export('leads', q)));
    }
};
__decorate([
    Get('dashboard'),
    ApiOperation({ summary: 'Administrative dashboard metrics' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "dashboard", null);
__decorate([
    Get('students/statistics'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "studentStatistics", null);
__decorate([
    Get('students/export'),
    Header('Content-Type', 'text/csv; charset=utf-8'),
    __param(0, Query()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportStudents", null);
__decorate([
    Get('students/:studentId'),
    __param(0, Param('studentId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "studentDetail", null);
__decorate([
    Get('students'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "students", null);
__decorate([
    Get('teachers/statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "teacherStatistics", null);
__decorate([
    Get('teachers/:teacherId'),
    __param(0, Param('teacherId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "teacherDetail", null);
__decorate([
    Get('teachers'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "teachers", null);
__decorate([
    Get('courses/:courseId'),
    __param(0, Param('courseId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "courseDetail", null);
__decorate([
    Get('courses'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "courses", null);
__decorate([
    Get('groups/:groupId'),
    __param(0, Param('groupId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "groupDetail", null);
__decorate([
    Get('groups'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "groups", null);
__decorate([
    Get('attendance/export'),
    Header('Content-Type', 'text/csv; charset=utf-8'),
    __param(0, Query()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportAttendance", null);
__decorate([
    Get('attendance'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "attendance", null);
__decorate([
    Get('finance/overview'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "financeOverview", null);
__decorate([
    Get('finance/payments/export'),
    Header('Content-Type', 'text/csv; charset=utf-8'),
    __param(0, Query()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportFinance", null);
__decorate([
    Get('finance/payments'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "payments", null);
__decorate([
    Get('finance/revenue-by-period'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "revenue", null);
__decorate([
    Get('finance/providers'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "providers", null);
__decorate([
    Get('finance/course-revenue'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "courseRevenue", null);
__decorate([
    Get('assignments/export'),
    Header('Content-Type', 'text/csv; charset=utf-8'),
    __param(0, Query()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportAssignments", null);
__decorate([
    Get('assignments'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "assignments", null);
__decorate([
    Get('crm/overview'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "crmOverview", null);
__decorate([
    Get('crm/conversion'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "crmConversion", null);
__decorate([
    Get('crm/operators'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "crmOperators", null);
__decorate([
    Get('crm/leads/export'),
    Header('Content-Type', 'text/csv; charset=utf-8'),
    __param(0, Query()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportLeads", null);
ReportsController = __decorate([
    ApiTags('Administrative reports'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/reports'),
    __metadata("design:paramtypes", [ReportsService])
], ReportsController);
export { ReportsController };
//# sourceMappingURL=reports.controller.js.map