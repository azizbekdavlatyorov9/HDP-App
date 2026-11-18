var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom, GroupSchedule, GroupStudent, LessonSession, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AdminGroupSchedulesController, GroupSchedulesController, SchedulingController, SessionsController, StudentSessionsController, TeacherSessionsController } from './scheduling.controller.js';
import { SchedulingService } from './scheduling.service.js';
let SchedulingModule = class SchedulingModule {
};
SchedulingModule = __decorate([
    Module({ imports: [TypeOrmModule.forFeature([Classroom, GroupSchedule, GroupStudent, LessonSession, StudyGroup, User, UserRole]), NotificationsModule], controllers: [SchedulingController, SessionsController, StudentSessionsController, TeacherSessionsController, GroupSchedulesController, AdminGroupSchedulesController], providers: [SchedulingService, JwtAuthGuard, RolesGuard] })
], SchedulingModule);
export { SchedulingModule };
//# sourceMappingURL=scheduling.module.js.map