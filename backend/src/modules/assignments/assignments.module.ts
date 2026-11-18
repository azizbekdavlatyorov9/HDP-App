import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment, AssignmentAttachment, AssignmentSubmission, AssignmentSubmissionAttachment, AssignmentSubmissionRevision, AssignmentSubmissionReview, AuditLog, Course, GroupStudent, Lesson, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AdminAssignmentsController, AdminSubmissionsController, StudentAssignmentsController, TeacherAssignmentAttachmentsController, TeacherAssignmentsController, TeacherSubmissionsController } from './assignments.controller.js';
import { ASSIGNMENT_STORAGE, UnavailableAssignmentStorageProvider } from './assignment-storage.provider.js';
import { AssignmentsService } from './assignments.service.js';

@Module({
  imports:[TypeOrmModule.forFeature([Assignment,AssignmentAttachment,AssignmentSubmission,AssignmentSubmissionRevision,AssignmentSubmissionAttachment,AssignmentSubmissionReview,AuditLog,Course,Lesson,StudyGroup,GroupStudent,User,UserRole]),NotificationsModule],
  controllers:[TeacherAssignmentsController,TeacherSubmissionsController,TeacherAssignmentAttachmentsController,StudentAssignmentsController,AdminAssignmentsController,AdminSubmissionsController],
  providers:[AssignmentsService,JwtAuthGuard,UnavailableAssignmentStorageProvider,{provide:ASSIGNMENT_STORAGE,useExisting:UnavailableAssignmentStorageProvider}],
})
export class AssignmentsModule {}
