var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment, AssignmentAttachment, AssignmentSubmission, AssignmentSubmissionAttachment, AssignmentSubmissionRevision, AssignmentSubmissionReview, AuditLog, Course, GroupStudent, Lesson, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AdminAssignmentsController, AdminSubmissionsController, StudentAssignmentsController, TeacherAssignmentAttachmentsController, TeacherAssignmentsController, TeacherSubmissionsController } from './assignments.controller.js';
import { ASSIGNMENT_STORAGE, UnavailableAssignmentStorageProvider } from './assignment-storage.provider.js';
import { AssignmentsService } from './assignments.service.js';
let AssignmentsModule = class AssignmentsModule {
};
AssignmentsModule = __decorate([
    Module({
        imports: [TypeOrmModule.forFeature([Assignment, AssignmentAttachment, AssignmentSubmission, AssignmentSubmissionRevision, AssignmentSubmissionAttachment, AssignmentSubmissionReview, AuditLog, Course, Lesson, StudyGroup, GroupStudent, User, UserRole]), NotificationsModule],
        controllers: [TeacherAssignmentsController, TeacherSubmissionsController, TeacherAssignmentAttachmentsController, StudentAssignmentsController, AdminAssignmentsController, AdminSubmissionsController],
        providers: [AssignmentsService, JwtAuthGuard, UnavailableAssignmentStorageProvider, { provide: ASSIGNMENT_STORAGE, useExisting: UnavailableAssignmentStorageProvider }],
    })
], AssignmentsModule);
export { AssignmentsModule };
//# sourceMappingURL=assignments.module.js.map