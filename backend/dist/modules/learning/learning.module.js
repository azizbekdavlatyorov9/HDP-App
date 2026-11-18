var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Enrollment, Lesson, LessonProgress } from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { LearningAccessService } from './learning-access.service.js';
let LearningModule = class LearningModule {
};
LearningModule = __decorate([
    Module({ imports: [TypeOrmModule.forFeature([Course, Enrollment, Lesson, LessonProgress])], providers: [LearningAccessService, JwtAuthGuard], exports: [LearningAccessService, JwtAuthGuard] })
], LearningModule);
export { LearningModule };
//# sourceMappingURL=learning.module.js.map