var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Enrollment, Payment, PaymentTransaction } from '../../database/entities/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PaymentsController, AdminPaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { PaymeProvider } from './payme.provider.js';
import { ClickProvider } from './click.provider.js';
import { ClickCallbackService } from './click-callback.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
let PaymentsModule = class PaymentsModule {
};
PaymentsModule = __decorate([
    Module({ imports: [TypeOrmModule.forFeature([Payment, PaymentTransaction, Course, Enrollment]), NotificationsModule], controllers: [PaymentsController, AdminPaymentsController], providers: [PaymentsService, PaymeProvider, ClickProvider, ClickCallbackService, JwtAuthGuard] })
], PaymentsModule);
export { PaymentsModule };
//# sourceMappingURL=payments.module.js.map