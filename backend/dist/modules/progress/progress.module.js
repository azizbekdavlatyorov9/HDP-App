var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, CourseProgress, Enrollment, Lesson, LessonProgress, Video } from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';
let ProgressModule = class ProgressModule {
};
ProgressModule = __decorate([
    Module({ imports: [TypeOrmModule.forFeature([Course, CourseProgress, Enrollment, Lesson, LessonProgress, Video]), LearningModule], controllers: [ProgressController], providers: [ProgressService] })
], ProgressModule);
export { ProgressModule };
//# sourceMappingURL=progress.module.js.map