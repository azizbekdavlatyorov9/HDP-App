import { DataSource, EntityManager, Repository } from 'typeorm';
import { DeviceToken, Notification, NotificationType, User } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import type { FcmProvider } from './fcm-provider.js';
import type { AdminCreateNotificationDto, NotificationListDto, RegisterDeviceDto } from './notifications.dto.js';
export declare class NotificationsService {
    private readonly notifications;
    private readonly devices;
    private readonly users;
    private readonly db;
    private readonly fcm;
    constructor(notifications: Repository<Notification>, devices: Repository<DeviceToken>, users: Repository<User>, db: DataSource, fcm: FcmProvider);
    private safeMetadata;
    queueWithin(manager: EntityManager, recipientId: string, input: {
        type: NotificationType;
        title: string;
        body: string;
        relatedEntityId?: string | null;
        metadata?: Record<string, unknown> | null;
        eventKey: string;
    }): Promise<string>;
    createAndDeliver(recipientId: string, input: {
        type: NotificationType;
        title: string;
        body: string;
        relatedEntityId?: string | null;
        metadata?: Record<string, unknown> | null;
        eventKey: string;
    }): Promise<void>;
    createAndDeliverMany(recipientIds: string[], input: {
        type: NotificationType;
        title: string;
        body: string;
        relatedEntityId?: string | null;
        metadata?: Record<string, unknown> | null;
        eventKey: string;
    }): Promise<void>;
    deliverAfterCommit(id: string): Promise<void>;
    registerDevice(user: AuthenticatedUser, dto: RegisterDeviceDto): Promise<{
        id: string;
        platform: "ANDROID" | "IOS";
        deviceName: string | null;
        lastSeenAt: Date;
    }>;
    listDevices(user: AuthenticatedUser): Promise<{
        id: string;
        platform: "ANDROID" | "IOS";
        deviceName: string | null;
        lastSeenAt: Date;
        createdAt: Date;
    }[]>;
    removeDevice(user: AuthenticatedUser, id: string): Promise<{
        removed: boolean;
    }>;
    list(user: AuthenticatedUser, query: NotificationListDto): Promise<{
        data: {
            id: string;
            type: NotificationType;
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
    private toView;
    unreadCount(user: AuthenticatedUser): Promise<{
        count: number;
    }>;
    markRead(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        isRead: boolean;
        readAt: Date;
    }>;
    readAll(user: AuthenticatedUser): Promise<{
        updated: number;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        deleted: boolean;
    }>;
    adminCreate(dto: AdminCreateNotificationDto): Promise<{
        queued: number;
    }>;
    adminList(query: NotificationListDto): Promise<{
        data: {
            recipientId: string;
            deliveryStatus: import("../../database/entities/notifications.entity.js").NotificationDeliveryStatus;
            id: string;
            type: NotificationType;
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
    statistics(): Promise<{
        delivery: {
            status: string;
            count: number;
        }[];
        total: number;
        readCount: number;
        unreadCount: number;
    }>;
}
