var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Enrollment, User } from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import { AdminEnrollmentsController, EnrollmentsController, } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
let EnrollmentsModule = class EnrollmentsModule {
};
EnrollmentsModule = __decorate([
    Module({
        imports: [
            TypeOrmModule.forFeature([Enrollment, User, Course]),
            LearningModule,
        ],
        controllers: [EnrollmentsController, AdminEnrollmentsController],
        providers: [EnrollmentsService, RolesGuard],
    })
], EnrollmentsModule);
export { EnrollmentsModule };
//# sourceMappingURL=enrollments.module.js.map