import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AdminCreateNotificationDto, NotificationListDto, RegisterDeviceDto, RemoveDeviceDto } from './notifications.dto.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('Notifications') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Post('devices') @Throttle({ default: { limit: 10, ttl: 60_000 } }) @ApiOperation({ summary: 'Register or reassign this user device FCM token' }) register(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegisterDeviceDto) { return this.service.registerDevice(user, dto); }
  @Delete('devices') @ApiOperation({ summary: 'Deactivate one of the current user devices' }) removeDevice(@CurrentUser() user: AuthenticatedUser, @Body() dto: RemoveDeviceDto) { return this.service.removeDevice(user, dto.deviceId); }
  @Get('devices') @ApiOperation({ summary: 'List current user devices without exposing tokens' }) devices(@CurrentUser() user: AuthenticatedUser) { return this.service.listDevices(user); }
  @Get() @ApiOperation({ summary: 'List current user notifications newest first' }) list(@CurrentUser() user: AuthenticatedUser, @Query() query: NotificationListDto) { return this.service.list(user, query); }
  @Get('unread-count') @ApiOperation({ summary: 'Count current user unread notifications' }) unread(@CurrentUser() user: AuthenticatedUser) { return this.service.unreadCount(user); }
  @Patch('read-all') @ApiOperation({ summary: 'Mark current user notifications as read' }) readAll(@CurrentUser() user: AuthenticatedUser) { return this.service.readAll(user); }
  @Patch(':id/read') @ApiOperation({ summary: 'Mark a current user notification as read' }) read(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.service.markRead(user, id); }
  @Delete(':id') @ApiOperation({ summary: 'Delete a current user notification' }) delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.service.remove(user, id); }
}

@ApiTags('Admin notifications') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('ADMIN','SUPER_ADMIN') @Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Post() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @ApiOperation({ summary: 'Send an announcement to selected users or all active users' }) create(@Body() dto: AdminCreateNotificationDto) { return this.service.adminCreate(dto); }
  @Get('statistics') @ApiOperation({ summary: 'View notification delivery and read statistics' }) statistics() { return this.service.statistics(); }
  @Get() @ApiOperation({ summary: 'Inspect notification records, excluding device tokens and provider credentials' }) list(@Query() query: NotificationListDto) { return this.service.adminList(query); }
}
