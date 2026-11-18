import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AttendanceBulkDto, AttendanceListDto, AttendanceUpdateDto, ReopenAttendanceDto } from './attendance.dto.js';
import { AttendanceService } from './attendance.service.js';

@ApiTags('Teacher attendance') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('TEACHER','ADMIN','SUPER_ADMIN') @Controller('teachers/me/sessions/:sessionId/attendance')
export class TeacherAttendanceController {
  constructor(private readonly service:AttendanceService){}
  @Get() @ApiOperation({summary:'View attendance state and records for an assigned session'}) view(@Param('sessionId') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.viewSession(id,u);}
  @Get('eligible') eligible(@Param('sessionId') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.eligibleStudents(id,u);}
  @Post('start') start(@Param('sessionId') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.start(id,u);}
  @Put() submit(@Param('sessionId') id:string,@Body() d:AttendanceBulkDto,@CurrentUser() u:AuthenticatedUser){return this.service.submit(id,d,u);}
  @Patch(':attendanceId') update(@Param('sessionId') id:string,@Param('attendanceId') aid:string,@Body() d:AttendanceUpdateDto,@CurrentUser() u:AuthenticatedUser){return this.service.update(id,aid,d,u);}
  @Post('finalize') finalize(@Param('sessionId') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.finalize(id,u);}
}

@ApiTags('Student attendance') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('STUDENT') @Controller('students/me/attendance')
export class StudentAttendanceController {
  constructor(private readonly service:AttendanceService){}
  @Get('statistics') statistics(@CurrentUser() u:AuthenticatedUser,@Query() q:AttendanceListDto){return this.service.statistics(u,undefined,q);}
  @Get() list(@CurrentUser() u:AuthenticatedUser,@Query() q:AttendanceListDto){return this.service.studentList(u,q);}
  @Get(':id') detail(@Param('id') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.studentDetail(id,u);}
}

@ApiTags('Administrative attendance') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('ADMIN','SUPER_ADMIN') @Controller('admin/attendance')
export class AdminAttendanceController {
  constructor(private readonly service:AttendanceService){}
  @Get('statistics') statistics(@Query() q:AttendanceListDto,@CurrentUser() u:AuthenticatedUser){return this.service.adminStatistics(q,u);}
  @Get('sessions/:sessionId') session(@Param('sessionId') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.viewSession(id,u);}
  @Get() list(@Query() q:AttendanceListDto,@CurrentUser() u:AuthenticatedUser){return this.service.adminList(q,u);}
  @Patch(':attendanceId') update(@Param('attendanceId') id:string,@Body() d:AttendanceUpdateDto,@CurrentUser() u:AuthenticatedUser){return this.service.adminUpdate(id,d,u);}
  @Post('sessions/:sessionId/reopen') reopen(@Param('sessionId') id:string,@Body() d:ReopenAttendanceDto,@CurrentUser() u:AuthenticatedUser){return this.service.reopen(id,d.reason,u);}
}
