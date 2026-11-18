import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Enrollment, Lesson, LessonProgress } from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { LearningAccessService } from './learning-access.service.js';

@Module({ imports: [TypeOrmModule.forFeature([Course, Enrollment, Lesson, LessonProgress])], providers: [LearningAccessService, JwtAuthGuard], exports: [LearningAccessService, JwtAuthGuard] })
export class LearningModule {}
