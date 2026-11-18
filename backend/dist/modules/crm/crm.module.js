var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthIdentity, AuditLog, Course, CrmLead, CrmLeadActivity, CrmLeadStatusHistory, CrmTrialLesson, CrmTrialLessonHistory, GroupStudent, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import { AuthModule } from '../auth/auth.module.js';
import { GroupsModule } from '../groups/groups.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { CrmAdminController, CrmOperatorController } from './crm.controller.js';
import { CrmService } from './crm.service.js';
let CrmModule = class CrmModule {
};
CrmModule = __decorate([
    Module({ imports: [TypeOrmModule.forFeature([CrmLead, CrmLeadActivity, CrmLeadStatusHistory, CrmTrialLesson, CrmTrialLessonHistory, User, UserRole, AuthIdentity, Course, StudyGroup, GroupStudent, AuditLog]), AuthModule, GroupsModule, NotificationsModule], controllers: [CrmAdminController, CrmOperatorController], providers: [CrmService] })
], CrmModule);
export { CrmModule };
//# sourceMappingURL=crm.module.js.map