import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AuditLog,
  Course,
  Enrollment,
  GroupStudent,
  StudyGroup,
  User,
  UserRole,
} from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import {
  AdminGroupsController,
  GroupsController,
  TeacherGroupsController,
} from './groups.controller.js';
import { GroupsService } from './groups.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudyGroup,
      GroupStudent,
      Course,
      Enrollment,
      User,
      UserRole,
      AuditLog,
    ]),
    NotificationsModule,
  ],
  controllers: [GroupsController, TeacherGroupsController, AdminGroupsController],
  providers: [GroupsService, JwtAuthGuard, RolesGuard],
  exports: [GroupsService],
})
export class GroupsModule {}
