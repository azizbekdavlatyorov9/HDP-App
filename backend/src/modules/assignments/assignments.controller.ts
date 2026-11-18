import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AssignmentCreateDto, AssignmentFileDto, AssignmentListDto, AssignmentStatusDto, AssignmentSubmissionDto, AssignmentUpdateDto, CompleteUploadDto, GradeSubmissionDto, ReturnSubmissionDto, SubmissionListDto } from './assignments.dto.js';
import { AssignmentsService } from './assignments.service.js';

@ApiTags('Teacher assignments') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('TEACHER','ADMIN','SUPER_ADMIN') @Controller('teachers/me/assignments')
export class TeacherAssignmentsController {
  constructor(private readonly service:AssignmentsService){}
  @Post() @ApiOperation({summary:'Create an assignment draft for a managed group'}) create(@Body() d:AssignmentCreateDto,@CurrentUser() u:AuthenticatedUser){return this.service.create(d,u);}
  @Get('statistics') statistics(@Query() q:AssignmentListDto,@CurrentUser() u:AuthenticatedUser){return this.service.teacherStatistics(u,q);}
  @Get() list(@Query() q:AssignmentListDto,@CurrentUser() u:AuthenticatedUser){return this.service.teacherList(q,u);}
  @Get(':id') get(@Param('id') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.teacherGet(id,u);}
  @Patch(':id') update(@Param('id') id:string,@Body() d:AssignmentUpdateDto,@CurrentUser() u:AuthenticatedUser){return this.service.update(id,d,u);}
  @Post(':id/publish') publish(@Param('id') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.publish(id,u);}
  @Post(':id/archive') archive(@Param('id') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.archive(id,u);}
  @Get(':id/submissions') submissions(@Param('id') id:string,@Query() q:SubmissionListDto,@CurrentUser() u:AuthenticatedUser){return this.service.listSubmissions(id,q,u);}
  @Post(':id/attachments/upload') upload(@Param('id') id:string,@Body() d:AssignmentFileDto,@CurrentUser() u:AuthenticatedUser){return this.service.assignmentUpload(id,d,u);}
  @Post(':id/attachments/complete') complete(@Param('id') id:string,@Body() d:CompleteUploadDto,@CurrentUser() u:AuthenticatedUser){return this.service.completeAssignmentUpload(id,d.uploadId,d,u);}
}

@ApiTags('Teacher submissions') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('TEACHER','ADMIN','SUPER_ADMIN') @Controller('teachers/me/submissions')
export class TeacherSubmissionsController {
  constructor(private readonly service:AssignmentsService){}
  @Get(':submissionId') get(@Param('submissionId') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.teacherSubmission(id,u);}
  @Post(':submissionId/grade') grade(@Param('submissionId') id:string,@Body() d:GradeSubmissionDto,@CurrentUser() u:AuthenticatedUser){return this.service.grade(id,d,u);}
  @Post(':submissionId/return') returnForCorrection(@Param('submissionId') id:string,@Body() d:ReturnSubmissionDto,@CurrentUser() u:AuthenticatedUser){return this.service.returnForCorrection(id,d,u);}
  @Get(':submissionId/attachments/:attachmentId/url') download(@Param('submissionId') id:string,@Param('attachmentId') aid:string,@CurrentUser() u:AuthenticatedUser){return this.service.submissionAttachmentUrl(id,aid,u);}
}

@ApiTags('Teacher assignment attachments') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('TEACHER','ADMIN','SUPER_ADMIN') @Controller('teachers/me/assignment-attachments')
export class TeacherAssignmentAttachmentsController {
  constructor(private readonly service:AssignmentsService){}
  @Get(':attachmentId/url') download(@Param('attachmentId') id:string,@Query('assignmentId') assignmentId:string,@CurrentUser() u:AuthenticatedUser){return this.service.assignmentAttachmentUrl(assignmentId,id,u);}
}

@ApiTags('Student assignments') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('STUDENT') @Controller('students/me')
export class StudentAssignmentsController {
  constructor(private readonly service:AssignmentsService){}
  @Get('assignments') list(@Query() q:AssignmentListDto,@CurrentUser() u:AuthenticatedUser){return this.service.studentList(q,u);}
  @Get('assignments/:id') get(@Param('id') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.studentGet(id,u);}
  @Get('assignments/:assignmentId/attachments/:attachmentId/url') assignmentAttachment(@Param('assignmentId') id:string,@Param('attachmentId') aid:string,@CurrentUser() u:AuthenticatedUser){return this.service.assignmentAttachmentUrl(id,aid,u);}
  @Post('assignments/:id/submissions') submit(@Param('id') id:string,@Body() d:AssignmentSubmissionDto,@CurrentUser() u:AuthenticatedUser){return this.service.submit(id,d,u);}
  @Get('submissions') submissions(@Query() q:SubmissionListDto,@CurrentUser() u:AuthenticatedUser){return this.service.studentSubmissionList(u,q);}
  @Get('submissions/:submissionId') submission(@Param('submissionId') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.studentSubmission(id,u);}
  @Patch('submissions/:submissionId') resubmit(@Param('submissionId') id:string,@Body() d:AssignmentSubmissionDto,@CurrentUser() u:AuthenticatedUser){return this.service.resubmit(id,d,u);}
  @Post('submissions/:submissionId/attachments/upload') upload(@Param('submissionId') id:string,@Body() d:AssignmentFileDto,@CurrentUser() u:AuthenticatedUser){return this.service.submissionUpload(id,d,u);}
  @Post('submissions/:submissionId/attachments/complete') complete(@Param('submissionId') id:string,@Body() d:CompleteUploadDto,@CurrentUser() u:AuthenticatedUser){return this.service.completeSubmissionUpload(id,d.uploadId,d,u);}
  @Get('submissions/:submissionId/attachments/:attachmentId/url') download(@Param('submissionId') id:string,@Param('attachmentId') aid:string,@CurrentUser() u:AuthenticatedUser){return this.service.submissionAttachmentUrl(id,aid,u);}
}

@ApiTags('Administrative assignments') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('ADMIN','SUPER_ADMIN') @Controller('admin/assignments')
export class AdminAssignmentsController {
  constructor(private readonly service:AssignmentsService){}
  @Get('statistics') statistics(@Query() q:AssignmentListDto,@CurrentUser() u:AuthenticatedUser){return this.service.adminStatistics(u,q);}
  @Get() list(@Query() q:AssignmentListDto,@CurrentUser() u:AuthenticatedUser){return this.service.adminList(q,u);}
  @Get(':id') get(@Param('id') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.adminGet(id,u);}
  @Patch(':id/status') status(@Param('id') id:string,@Body() d:AssignmentStatusDto,@CurrentUser() u:AuthenticatedUser){return this.service.adminStatus(id,d.status,u);}
}
@ApiTags('Administrative submissions') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('ADMIN','SUPER_ADMIN') @Controller('admin/submissions')
export class AdminSubmissionsController {
  constructor(private readonly service:AssignmentsService){}
  @Get() list(@Query() q:SubmissionListDto,@CurrentUser() u:AuthenticatedUser){return this.service.adminSubmissions(q,u);}
}
