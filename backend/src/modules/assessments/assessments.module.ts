import { Module } from '@nestjs/common'; import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerOption, Course, Enrollment, Lesson, Question, StudentAnswer, StudentAnswerOption, Test, TestAttempt } from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js'; import { AssessmentsController } from './assessments.controller.js'; import { AssessmentsService } from './assessments.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
@Module({imports:[TypeOrmModule.forFeature([Test,Question,AnswerOption,TestAttempt,StudentAnswer,StudentAnswerOption,Course,Lesson,Enrollment]),LearningModule,NotificationsModule],controllers:[AssessmentsController],providers:[AssessmentsService]}) export class AssessmentsModule{}
