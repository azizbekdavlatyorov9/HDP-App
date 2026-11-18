var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminCreateNotificationDto, NotificationListDto, RegisterDeviceDto, RemoveDeviceDto } from './notifications.dto.js';
import { NotificationsService } from './notifications.service.js';
let NotificationsController = class NotificationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    register(user, dto) { return this.service.registerDevice(user, dto); }
    removeDevice(user, dto) { return this.service.removeDevice(user, dto.deviceId); }
    devices(user) { return this.service.listDevices(user); }
    list(user, query) { return this.service.list(user, query); }
    unread(user) { return this.service.unreadCount(user); }
    readAll(user) { return this.service.readAll(user); }
    read(user, id) { return this.service.markRead(user, id); }
    delete(user, id) { return this.service.remove(user, id); }
};
__decorate([
    Post('devices'),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    ApiOperation({ summary: 'Register or reassign this user device FCM token' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RegisterDeviceDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "register", null);
__decorate([
    Delete('devices'),
    ApiOperation({ summary: 'Deactivate one of the current user devices' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RemoveDeviceDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "removeDevice", null);
__decorate([
    Get('devices'),
    ApiOperation({ summary: 'List current user devices without exposing tokens' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "devices", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'List current user notifications newest first' }),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, NotificationListDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "list", null);
__decorate([
    Get('unread-count'),
    ApiOperation({ summary: 'Count current user unread notifications' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "unread", null);
__decorate([
    Patch('read-all'),
    ApiOperation({ summary: 'Mark current user notifications as read' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "readAll", null);
__decorate([
    Patch(':id/read'),
    ApiOperation({ summary: 'Mark a current user notification as read' }),
    __param(0, CurrentUser()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "read", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Delete a current user notification' }),
    __param(0, CurrentUser()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "delete", null);
NotificationsController = __decorate([
    ApiTags('Notifications'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('notifications'),
    __metadata("design:paramtypes", [NotificationsService])
], NotificationsController);
export { NotificationsController };
let AdminNotificationsController = class AdminNotificationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) { return this.service.adminCreate(dto); }
    statistics() { return this.service.statistics(); }
    list(query) { return this.service.adminList(query); }
};
__decorate([
    Post(),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Send an announcement to selected users or all active users' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminCreateNotificationDto]),
    __metadata("design:returntype", void 0)
], AdminNotificationsController.prototype, "create", null);
__decorate([
    Get('statistics'),
    ApiOperation({ summary: 'View notification delivery and read statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminNotificationsController.prototype, "statistics", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'Inspect notification records, excluding device tokens and provider credentials' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [NotificationListDto]),
    __metadata("design:returntype", void 0)
], AdminNotificationsController.prototype, "list", null);
AdminNotificationsController = __decorate([
    ApiTags('Admin notifications'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/notifications'),
    __metadata("design:paramtypes", [NotificationsService])
], AdminNotificationsController);
export { AdminNotificationsController };
//# sourceMappingURL=notifications.controller.js.map