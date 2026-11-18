import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Module({ controllers: [ReportsController], providers: [ReportsService, JwtAuthGuard] })
export class ReportsModule {}
