import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AdminCreateNotificationDto, NotificationListDto, RegisterDeviceDto, RemoveDeviceDto } from './notifications.dto.js';
import { NotificationsService } from './notifications.service.js';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    register(user: AuthenticatedUser, dto: RegisterDeviceDto): Promise<{
        id: string;
        platform: "ANDROID" | "IOS";
        deviceName: string | null;
        lastSeenAt: Date;
    }>;
    removeDevice(user: AuthenticatedUser, dto: RemoveDeviceDto): Promise<{
        removed: boolean;
    }>;
    devices(user: AuthenticatedUser): Promise<{
        id: string;
        platform: "ANDROID" | "IOS";
        deviceName: string | null;
        lastSeenAt: Date;
        createdAt: Date;
    }[]>;
    list(user: AuthenticatedUser, query: NotificationListDto): Promise<{
        data: {
            id: string;
            type: import("../../database/entities/notifications.entity.js").NotificationType;
            title: string;
            body: string;
            relatedEntityId: string | null;
            metadata: Record<string, string | number | boolean> | null;
            isRead: boolean;
            readAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    unread(user: AuthenticatedUser): Promise<{
        count: number;
    }>;
    readAll(user: AuthenticatedUser): Promise<{
        updated: number;
    }>;
    read(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        isRead: boolean;
        readAt: Date;
    }>;
    delete(user: AuthenticatedUser, id: string): Promise<{
        deleted: boolean;
    }>;
}
export declare class AdminNotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    create(dto: AdminCreateNotificationDto): Promise<{
        queued: number;
    }>;
    statistics(): Promise<{
        delivery: {
            status: string;
            count: number;
        }[];
        total: number;
        readCount: number;
        unreadCount: number;
    }>;
    list(query: NotificationListDto): Promise<{
        data: {
            recipientId: string;
            deliveryStatus: import("../../database/entities/notifications.entity.js").NotificationDeliveryStatus;
            id: string;
            type: import("../../database/entities/notifications.entity.js").NotificationType;
            title: string;
            body: string;
            relatedEntityId: string | null;
            metadata: Record<string, string | number | boolean> | null;
            isRead: boolean;
            readAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
