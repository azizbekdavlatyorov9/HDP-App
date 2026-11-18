import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import {
  AddEnrollmentToGroupDto,
  AddStudentDto,
  AssignGroupTeacherDto,
  GroupCreateDto,
  GroupListDto,
  GroupStatusDto,
  GroupUpdateDto,
  MembershipStatusDto,
} from './groups.dto.js';
import { GroupsService } from './groups.service.js';

@ApiTags('Study groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly service: GroupsService) {}
  @Post() create(@Body() d: GroupCreateDto, @CurrentUser() u: AuthenticatedUser) {
    return this.service.create(d, u);
  }
  @Get() @ApiOperation({ summary: 'List groups visible to the authenticated user' })
  list(@Query() q: GroupListDto, @CurrentUser() u: AuthenticatedUser) {
    return this.service.list(u, q);
  }
  @Get('me') me(@CurrentUser() u: AuthenticatedUser) { return this.service.studentGroups(u); }
  @Get(':id') get(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) { return this.service.get(id, u); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() d: GroupUpdateDto, @CurrentUser() u: AuthenticatedUser) { return this.service.update(id, d, u); }
  @Patch(':id/status') status(@Param('id', ParseUUIDPipe) id: string, @Body() d: GroupStatusDto, @CurrentUser() u: AuthenticatedUser) { return this.service.setStatus(id, d.status, u); }
  @Post(':id/students') add(@Param('id', ParseUUIDPipe) id: string, @Body() d: AddStudentDto, @CurrentUser() u: AuthenticatedUser) { return this.service.addStudent(id, d.studentId, u); }
  @Get(':id/students') students(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) { return this.service.students(id, u); }
  @Get(':id/memberships') history(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) { return this.service.history(id, u); }
  @Patch(':id/memberships/:membershipId') membershipStatus(@Param('id', ParseUUIDPipe) id: string, @Param('membershipId', ParseUUIDPipe) mid: string, @Body() d: MembershipStatusDto, @CurrentUser() u: AuthenticatedUser) { return this.service.setMembershipStatus(id, mid, d.status, u); }
  @Delete(':id/students/:studentId') remove(@Param('id', ParseUUIDPipe) id: string, @Param('studentId', ParseUUIDPipe) studentId: string, @CurrentUser() u: AuthenticatedUser) { return this.service.removeStudent(id, studentId, u); }
}

@ApiTags('Admin study groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/groups')
export class AdminGroupsController {
  constructor(private readonly service: GroupsService) {}
  @Post() create(@Body() d: GroupCreateDto, @CurrentUser() u: AuthenticatedUser) { return this.service.create(d, u); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() d: GroupUpdateDto, @CurrentUser() u: AuthenticatedUser) { return this.service.update(id, d, u); }
  @Delete(':id') archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) { return this.service.archive(id, u); }
  @Patch(':id/teacher') teacher(@Param('id', ParseUUIDPipe) id: string, @Body() d: AssignGroupTeacherDto, @CurrentUser() u: AuthenticatedUser) { return this.service.update(id, { teacherId: d.teacherId }, u); }
  @Post(':id/students') addStudent(@Param('id', ParseUUIDPipe) id: string, @Body() d: AddEnrollmentToGroupDto, @CurrentUser() u: AuthenticatedUser) { return this.service.addEnrollment(id, d.enrollmentId, u); }
  @Delete(':id/students/:enrollmentId') removeStudent(@Param('id', ParseUUIDPipe) id: string, @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string, @CurrentUser() u: AuthenticatedUser) { return this.service.removeEnrollment(id, enrollmentId, u); }
}

@ApiTags('Teacher groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeacherGroupsController {
  constructor(private readonly service: GroupsService) {}
  @Get('me/groups') me(@CurrentUser() u: AuthenticatedUser) { return this.service.teacherGroups(u, u.id); }
  @Get(':teacherId/groups') byTeacher(@Param('teacherId', ParseUUIDPipe) id: string, @CurrentUser() u: AuthenticatedUser) { return this.service.teacherGroups(u, id); }
}
