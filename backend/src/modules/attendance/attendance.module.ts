import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance, AttendanceHistory, AttendanceSession, GroupStudent, LessonSession } from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AdminAttendanceController, StudentAttendanceController, TeacherAttendanceController } from './attendance.controller.js';
import { AttendanceService } from './attendance.service.js';

@Module({imports:[TypeOrmModule.forFeature([Attendance,AttendanceHistory,AttendanceSession,GroupStudent,LessonSession]),NotificationsModule],controllers:[TeacherAttendanceController,StudentAttendanceController,AdminAttendanceController],providers:[AttendanceService,JwtAuthGuard]})
export class AttendanceModule {}
