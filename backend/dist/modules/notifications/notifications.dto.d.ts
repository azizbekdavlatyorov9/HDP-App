import type { NotificationType } from '../../database/entities/notifications.entity.js';
export declare class RegisterDeviceDto {
    token: string;
    platform: 'ANDROID' | 'IOS';
    deviceName?: string;
}
export declare class RemoveDeviceDto {
    deviceId: string;
}
export declare class NotificationListDto {
    page: number;
    limit: number;
    unread?: string;
}
export declare class AdminCreateNotificationDto {
    idempotencyKey: string;
    userIds?: string[];
    type: NotificationType;
    title: string;
    body: string;
    relatedEntityId?: string;
    metadata?: Record<string, unknown>;
}
