import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Course,
  Lesson,
  LessonPrerequisite,
  Subject,
} from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { LessonsController } from './lessons.controller.js';
import { LessonsService } from './lessons.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Subject, Lesson, LessonPrerequisite]),
    LearningModule,
    NotificationsModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService, RolesGuard],
})
export class LessonsModule {}
