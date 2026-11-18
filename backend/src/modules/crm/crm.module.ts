import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthIdentity, AuditLog, Course, CrmLead, CrmLeadActivity, CrmLeadStatusHistory, CrmTrialLesson, CrmTrialLessonHistory, GroupStudent, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import { AuthModule } from '../auth/auth.module.js';
import { GroupsModule } from '../groups/groups.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { CrmAdminController, CrmOperatorController } from './crm.controller.js';
import { CrmService } from './crm.service.js';

@Module({imports:[TypeOrmModule.forFeature([CrmLead,CrmLeadActivity,CrmLeadStatusHistory,CrmTrialLesson,CrmTrialLessonHistory,User,UserRole,AuthIdentity,Course,StudyGroup,GroupStudent,AuditLog]),AuthModule,GroupsModule,NotificationsModule],controllers:[CrmAdminController,CrmOperatorController],providers:[CrmService]})
export class CrmModule{}
