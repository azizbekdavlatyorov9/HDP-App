import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken, Notification, User } from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminNotificationsController, NotificationsController } from './notifications.controller.js';
import { FCM_PROVIDER } from './fcm-provider.js';
import { FirebaseAdminProvider } from './firebase-admin.provider.js';
import { NotificationsService } from './notifications.service.js';

@Module({ imports: [TypeOrmModule.forFeature([Notification, DeviceToken, User])], controllers: [NotificationsController, AdminNotificationsController], providers: [NotificationsService, FirebaseAdminProvider, { provide: FCM_PROVIDER, useExisting: FirebaseAdminProvider }, JwtAuthGuard], exports: [NotificationsService] })
export class NotificationsModule {}
