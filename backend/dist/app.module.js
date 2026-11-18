var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import Joi from 'joi';
import { RolesGuard } from './common/guards/roles.guard.js';
import { createNeonDataSourceOptions } from './database/neon-data-source-options.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { SubjectsModule } from './modules/subjects/subjects.module.js';
import { LessonsModule } from './modules/lessons/lessons.module.js';
import { VideosModule } from './modules/videos/videos.module.js';
import { AssessmentsModule } from './modules/assessments/assessments.module.js';
import { ProgressModule } from './modules/progress/progress.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { GroupsModule } from './modules/groups/groups.module.js';
import { ClassroomsModule } from './modules/classrooms/classrooms.module.js';
import { SchedulingModule } from './modules/scheduling/scheduling.module.js';
import { AttendanceModule } from './modules/attendance/attendance.module.js';
import { AssignmentsModule } from './modules/assignments/assignments.module.js';
import { CrmModule } from './modules/crm/crm.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            AuthModule,
            UsersModule,
            CoursesModule,
            SubjectsModule,
            LessonsModule,
            VideosModule,
            AssessmentsModule,
            ProgressModule,
            PaymentsModule,
            EnrollmentsModule,
            NotificationsModule,
            GroupsModule,
            ClassroomsModule,
            SchedulingModule,
            AttendanceModule,
            AssignmentsModule,
            CrmModule,
            ReportsModule,
            ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string()
                        .valid('development', 'production', 'staging', 'test')
                        .default('development'),
                    PORT: Joi.number().default(4000),
                    DATABASE_URL: Joi.string()
                        .uri({ scheme: ['postgres', 'postgresql'] })
                        .required(),
                    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
                    OTP_HASH_SECRET: Joi.string().min(32).required(),
                    TELEGRAM_CLIENT_ID: Joi.string().optional(),
                    TELEGRAM_CLIENT_SECRET: Joi.string().optional(),
                    TELEGRAM_OIDC_PROBE_ENABLED: Joi.boolean().default(false),
                    TELEGRAM_OIDC_PROBE_REDIRECT_URI: Joi.string()
                        .uri({ scheme: ['https'] })
                        .optional(),
                    CLOUDFLARE_ACCOUNT_ID: Joi.string().optional(),
                    CLOUDFLARE_API_TOKEN: Joi.string().optional(),
                    CLOUDFLARE_STREAM_API_TOKEN: Joi.string().optional(),
                    CLOUDFLARE_STREAM_CUSTOMER_CODE: Joi.string().optional(),
                    CLOUDFLARE_WEBHOOK_SECRET: Joi.string().optional(),
                    STAGING_CLOUDFLARE_ACCOUNT_ID: Joi.string().optional(),
                    STAGING_CLOUDFLARE_STREAM_API_TOKEN: Joi.string().optional(),
                    STAGING_CLOUDFLARE_STREAM_CUSTOMER_CODE: Joi.string().optional(),
                    STAGING_CLOUDFLARE_WEBHOOK_SECRET: Joi.string().optional(),
                    PAYME_MERCHANT_ID: Joi.string().optional(),
                    PAYME_MERCHANT_PASSWORD: Joi.string().optional(),
                    PAYME_RETURN_URL: Joi.string().uri().optional(),
                    CLICK_SERVICE_ID: Joi.string().optional(),
                    CLICK_MERCHANT_ID: Joi.string().optional(),
                    CLICK_SECRET_KEY: Joi.string().optional(),
                    FIREBASE_PROJECT_ID: Joi.string().optional(),
                    GOOGLE_APPLICATION_CREDENTIALS: Joi.string().optional(),
                }),
            }),
            TypeOrmModule.forRootAsync({
                inject: [ConfigService],
                useFactory: (config) => ({
                    ...createNeonDataSourceOptions({
                        DATABASE_URL: config.get('DATABASE_URL'),
                    }),
                    autoLoadEntities: true,
                }),
            }),
            ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
        ],
        providers: [
            { provide: APP_GUARD, useClass: ThrottlerGuard },
            { provide: APP_GUARD, useClass: RolesGuard },
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map