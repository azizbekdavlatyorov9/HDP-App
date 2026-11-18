import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Category,
  Course,
  CourseCategory,
  User,
  UserRole,
} from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import {
  CategoriesController,
  CoursesController,
} from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Category,
      CourseCategory,
      User,
      UserRole,
    ]),
    LearningModule,
    NotificationsModule,
  ],
  controllers: [CoursesController, CategoriesController],
  providers: [CoursesService, RolesGuard],
})
export class CoursesModule {}
