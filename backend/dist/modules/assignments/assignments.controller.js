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
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AssignmentCreateDto, AssignmentFileDto, AssignmentListDto, AssignmentStatusDto, AssignmentSubmissionDto, AssignmentUpdateDto, CompleteUploadDto, GradeSubmissionDto, ReturnSubmissionDto, SubmissionListDto } from './assignments.dto.js';
import { AssignmentsService } from './assignments.service.js';
let TeacherAssignmentsController = class TeacherAssignmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d, u) { return this.service.create(d, u); }
    statistics(q, u) { return this.service.teacherStatistics(u, q); }
    list(q, u) { return this.service.teacherList(q, u); }
    get(id, u) { return this.service.teacherGet(id, u); }
    update(id, d, u) { return this.service.update(id, d, u); }
    publish(id, u) { return this.service.publish(id, u); }
    archive(id, u) { return this.service.archive(id, u); }
    submissions(id, q, u) { return this.service.listSubmissions(id, q, u); }
    upload(id, d, u) { return this.service.assignmentUpload(id, d, u); }
    complete(id, d, u) { return this.service.completeAssignmentUpload(id, d.uploadId, d, u); }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Create an assignment draft for a managed group' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssignmentCreateDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "create", null);
__decorate([
    Get('statistics'),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssignmentListDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "statistics", null);
__decorate([
    Get(),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssignmentListDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "get", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignmentUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "update", null);
__decorate([
    Post(':id/publish'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "publish", null);
__decorate([
    Post(':id/archive'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "archive", null);
__decorate([
    Get(':id/submissions'),
    __param(0, Param('id')),
    __param(1, Query()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubmissionListDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "submissions", null);
__decorate([
    Post(':id/attachments/upload'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignmentFileDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "upload", null);
__decorate([
    Post(':id/attachments/complete'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CompleteUploadDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentsController.prototype, "complete", null);
TeacherAssignmentsController = __decorate([
    ApiTags('Teacher assignments'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
    Controller('teachers/me/assignments'),
    __metadata("design:paramtypes", [AssignmentsService])
], TeacherAssignmentsController);
export { TeacherAssignmentsController };
let TeacherSubmissionsController = class TeacherSubmissionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    get(id, u) { return this.service.teacherSubmission(id, u); }
    grade(id, d, u) { return this.service.grade(id, d, u); }
    returnForCorrection(id, d, u) { return this.service.returnForCorrection(id, d, u); }
    download(id, aid, u) { return this.service.submissionAttachmentUrl(id, aid, u); }
};
__decorate([
    Get(':submissionId'),
    __param(0, Param('submissionId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherSubmissionsController.prototype, "get", null);
__decorate([
    Post(':submissionId/grade'),
    __param(0, Param('submissionId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, GradeSubmissionDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherSubmissionsController.prototype, "grade", null);
__decorate([
    Post(':submissionId/return'),
    __param(0, Param('submissionId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReturnSubmissionDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherSubmissionsController.prototype, "returnForCorrection", null);
__decorate([
    Get(':submissionId/attachments/:attachmentId/url'),
    __param(0, Param('submissionId')),
    __param(1, Param('attachmentId')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TeacherSubmissionsController.prototype, "download", null);
TeacherSubmissionsController = __decorate([
    ApiTags('Teacher submissions'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
    Controller('teachers/me/submissions'),
    __metadata("design:paramtypes", [AssignmentsService])
], TeacherSubmissionsController);
export { TeacherSubmissionsController };
let TeacherAssignmentAttachmentsController = class TeacherAssignmentAttachmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    download(id, assignmentId, u) { return this.service.assignmentAttachmentUrl(assignmentId, id, u); }
};
__decorate([
    Get(':attachmentId/url'),
    __param(0, Param('attachmentId')),
    __param(1, Query('assignmentId')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TeacherAssignmentAttachmentsController.prototype, "download", null);
TeacherAssignmentAttachmentsController = __decorate([
    ApiTags('Teacher assignment attachments'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
    Controller('teachers/me/assignment-attachments'),
    __metadata("design:paramtypes", [AssignmentsService])
], TeacherAssignmentAttachmentsController);
export { TeacherAssignmentAttachmentsController };
let StudentAssignmentsController = class StudentAssignmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(q, u) { return this.service.studentList(q, u); }
    get(id, u) { return this.service.studentGet(id, u); }
    assignmentAttachment(id, aid, u) { return this.service.assignmentAttachmentUrl(id, aid, u); }
    submit(id, d, u) { return this.service.submit(id, d, u); }
    submissions(q, u) { return this.service.studentSubmissionList(u, q); }
    submission(id, u) { return this.service.studentSubmission(id, u); }
    resubmit(id, d, u) { return this.service.resubmit(id, d, u); }
    upload(id, d, u) { return this.service.submissionUpload(id, d, u); }
    complete(id, d, u) { return this.service.completeSubmissionUpload(id, d.uploadId, d, u); }
    download(id, aid, u) { return this.service.submissionAttachmentUrl(id, aid, u); }
};
__decorate([
    Get('assignments'),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssignmentListDto, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "list", null);
__decorate([
    Get('assignments/:id'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "get", null);
__decorate([
    Get('assignments/:assignmentId/attachments/:attachmentId/url'),
    __param(0, Param('assignmentId')),
    __param(1, Param('attachmentId')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "assignmentAttachment", null);
__decorate([
    Post('assignments/:id/submissions'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignmentSubmissionDto, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "submit", null);
__decorate([
    Get('submissions'),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubmissionListDto, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "submissions", null);
__decorate([
    Get('submissions/:submissionId'),
    __param(0, Param('submissionId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "submission", null);
__decorate([
    Patch('submissions/:submissionId'),
    __param(0, Param('submissionId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignmentSubmissionDto, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "resubmit", null);
__decorate([
    Post('submissions/:submissionId/attachments/upload'),
    __param(0, Param('submissionId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignmentFileDto, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "upload", null);
__decorate([
    Post('submissions/:submissionId/attachments/complete'),
    __param(0, Param('submissionId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CompleteUploadDto, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "complete", null);
__decorate([
    Get('submissions/:submissionId/attachments/:attachmentId/url'),
    __param(0, Param('submissionId')),
    __param(1, Param('attachmentId')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StudentAssignmentsController.prototype, "download", null);
StudentAssignmentsController = __decorate([
    ApiTags('Student assignments'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('STUDENT'),
    Controller('students/me'),
    __metadata("design:paramtypes", [AssignmentsService])
], StudentAssignmentsController);
export { StudentAssignmentsController };
let AdminAssignmentsController = class AdminAssignmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    statistics(q, u) { return this.service.adminStatistics(u, q); }
    list(q, u) { return this.service.adminList(q, u); }
    get(id, u) { return this.service.adminGet(id, u); }
    status(id, d, u) { return this.service.adminStatus(id, d.status, u); }
};
__decorate([
    Get('statistics'),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssignmentListDto, Object]),
    __metadata("design:returntype", void 0)
], AdminAssignmentsController.prototype, "statistics", null);
__decorate([
    Get(),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssignmentListDto, Object]),
    __metadata("design:returntype", void 0)
], AdminAssignmentsController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminAssignmentsController.prototype, "get", null);
__decorate([
    Patch(':id/status'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignmentStatusDto, Object]),
    __metadata("design:returntype", void 0)
], AdminAssignmentsController.prototype, "status", null);
AdminAssignmentsController = __decorate([
    ApiTags('Administrative assignments'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/assignments'),
    __metadata("design:paramtypes", [AssignmentsService])
], AdminAssignmentsController);
export { AdminAssignmentsController };
let AdminSubmissionsController = class AdminSubmissionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(q, u) { return this.service.adminSubmissions(q, u); }
};
__decorate([
    Get(),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubmissionListDto, Object]),
    __metadata("design:returntype", void 0)
], AdminSubmissionsController.prototype, "list", null);
AdminSubmissionsController = __decorate([
    ApiTags('Administrative submissions'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/submissions'),
    __metadata("design:paramtypes", [AssignmentsService])
], AdminSubmissionsController);
export { AdminSubmissionsController };
//# sourceMappingURL=assignments.controller.js.map