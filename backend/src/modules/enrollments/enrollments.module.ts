import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Enrollment, User } from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import {
  AdminEnrollmentsController,
  EnrollmentsController,
} from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, User, Course]),
    LearningModule,
  ],
  controllers: [EnrollmentsController, AdminEnrollmentsController],
  providers: [EnrollmentsService, RolesGuard],
})
export class EnrollmentsModule {}
