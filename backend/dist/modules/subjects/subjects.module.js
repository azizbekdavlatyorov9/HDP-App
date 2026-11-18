var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Subject } from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CourseSubjectsController, SubjectsController, } from './subjects.controller.js';
import { SubjectsService } from './subjects.service.js';
let SubjectsModule = class SubjectsModule {
};
SubjectsModule = __decorate([
    Module({
        imports: [TypeOrmModule.forFeature([Subject, Course]), LearningModule],
        controllers: [CourseSubjectsController, SubjectsController],
        providers: [SubjectsService, RolesGuard],
    })
], SubjectsModule);
export { SubjectsModule };
//# sourceMappingURL=subjects.module.js.map