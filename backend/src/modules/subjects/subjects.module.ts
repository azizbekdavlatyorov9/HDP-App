import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Subject } from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import {
  CourseSubjectsController,
  SubjectsController,
} from './subjects.controller.js';
import { SubjectsService } from './subjects.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Course]), LearningModule],
  controllers: [CourseSubjectsController, SubjectsController],
  providers: [SubjectsService, RolesGuard],
})
export class SubjectsModule {}
