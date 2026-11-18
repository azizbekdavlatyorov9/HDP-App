import {
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DashboardQueryDto, ReportQueryDto } from './reports.dto.js';
import { ReportsService } from './reports.service.js';

@ApiTags('Administrative reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}
  @Get('dashboard')
  @ApiOperation({ summary: 'Administrative dashboard metrics' })
  dashboard(@Query() q: DashboardQueryDto) {
    return this.reports.dashboard(q);
  }
  @Get('students/statistics') studentStatistics(@Query() q: ReportQueryDto) {
    return this.reports.studentStatistics(q);
  }
  @Get('students/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportStudents(@Query() q: ReportQueryDto, @Res() res: Response) {
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="students-report.csv"',
    );
    res.send('\uFEFF' + (await this.reports.export('students', q)));
  }
  @Get('students/:studentId') studentDetail(
    @Param('studentId', ParseUUIDPipe) id: string,
  ) {
    return this.reports.studentDetail(id);
  }
  @Get('students') students(@Query() q: ReportQueryDto) {
    return this.reports.studentList(q);
  }
  @Get('teachers/statistics') teacherStatistics() {
    return this.reports.teacherStatistics();
  }
  @Get('teachers/:teacherId') teacherDetail(
    @Param('teacherId', ParseUUIDPipe) id: string,
  ) {
    return this.reports.teacherDetail(id);
  }
  @Get('teachers') teachers(@Query() q: ReportQueryDto) {
    return this.reports.teacherList(q);
  }
  @Get('courses/:courseId') courseDetail(
    @Param('courseId', ParseUUIDPipe) id: string,
  ) {
    return this.reports.courseDetail(id);
  }
  @Get('courses') courses(@Query() q: ReportQueryDto) {
    return this.reports.courseList(q);
  }
  @Get('groups/:groupId') groupDetail(
    @Param('groupId', ParseUUIDPipe) id: string,
  ) {
    return this.reports.groupDetail(id);
  }
  @Get('groups') groups(@Query() q: ReportQueryDto) {
    return this.reports.groupList(q);
  }
  @Get('attendance/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportAttendance(@Query() q: ReportQueryDto, @Res() res: Response) {
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="attendance-report.csv"',
    );
    res.send('\uFEFF' + (await this.reports.export('attendance', q)));
  }
  @Get('attendance') attendance(@Query() q: ReportQueryDto) {
    return this.reports.attendance(q);
  }
  @Get('finance/overview') financeOverview(@Query() q: ReportQueryDto) {
    return this.reports.financeOverview(q);
  }
  @Get('finance/payments/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportFinance(@Query() q: ReportQueryDto, @Res() res: Response) {
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="payments-report.csv"',
    );
    res.send('\uFEFF' + (await this.reports.export('finance', q)));
  }
  @Get('finance/payments') payments(@Query() q: ReportQueryDto) {
    return this.reports.paymentList(q);
  }
  @Get('finance/revenue-by-period') revenue(@Query() q: ReportQueryDto) {
    return this.reports.revenueByPeriod(q);
  }
  @Get('finance/providers') providers(@Query() q: ReportQueryDto) {
    return this.reports.providers(q);
  }
  @Get('finance/course-revenue') courseRevenue(@Query() q: ReportQueryDto) {
    return this.reports.courseRevenue(q);
  }
  @Get('assignments/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportAssignments(@Query() q: ReportQueryDto, @Res() res: Response) {
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="assignments-report.csv"',
    );
    res.send('\uFEFF' + (await this.reports.export('assignments', q)));
  }
  @Get('assignments') assignments(@Query() q: ReportQueryDto) {
    return this.reports.assignmentReports(q);
  }
  @Get('crm/overview') crmOverview(@Query() q: ReportQueryDto) {
    return this.reports.crmOverview(q);
  }
  @Get('crm/conversion') crmConversion(@Query() q: ReportQueryDto) {
    return this.reports.crmConversion(q);
  }
  @Get('crm/operators') crmOperators(@Query() q: ReportQueryDto) {
    return this.reports.crmOperators(q);
  }
  @Get('crm/leads/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportLeads(@Query() q: ReportQueryDto, @Res() res: Response) {
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="crm-leads-report.csv"',
    );
    res.send('\uFEFF' + (await this.reports.export('leads', q)));
  }
}
