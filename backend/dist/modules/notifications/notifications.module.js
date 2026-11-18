var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken, Notification, User } from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminNotificationsController, NotificationsController } from './notifications.controller.js';
import { FCM_PROVIDER } from './fcm-provider.js';
import { FirebaseAdminProvider } from './firebase-admin.provider.js';
import { NotificationsService } from './notifications.service.js';
let NotificationsModule = class NotificationsModule {
};
NotificationsModule = __decorate([
    Module({ imports: [TypeOrmModule.forFeature([Notification, DeviceToken, User])], controllers: [NotificationsController, AdminNotificationsController], providers: [NotificationsService, FirebaseAdminProvider, { provide: FCM_PROVIDER, useExisting: FirebaseAdminProvider }, JwtAuthGuard], exports: [NotificationsService] })
], NotificationsModule);
export { NotificationsModule };
//# sourceMappingURL=notifications.module.js.map