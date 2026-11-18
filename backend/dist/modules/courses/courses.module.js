var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Course, CourseCategory, User, UserRole, } from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import { CategoriesController, CoursesController, } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
let CoursesModule = class CoursesModule {
};
CoursesModule = __decorate([
    Module({
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
], CoursesModule);
export { CoursesModule };
//# sourceMappingURL=courses.module.js.map