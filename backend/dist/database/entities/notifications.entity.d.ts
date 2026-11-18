import type { Relation } from 'typeorm';
import { User } from './core.entity.js';
export declare enum NotificationType {
    GENERAL = "GENERAL",
    COURSE_PUBLISHED = "COURSE_PUBLISHED",
    NEW_LESSON = "NEW_LESSON",
    LESSON_UPDATED = "LESSON_UPDATED",
    TEST_AVAILABLE = "TEST_AVAILABLE",
    TEST_RESULT = "TEST_RESULT",
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    PAYMENT_CANCELLED = "PAYMENT_CANCELLED",
    ENROLLMENT_CREATED = "ENROLLMENT_CREATED",
    SCHEDULE_UPDATED = "SCHEDULE_UPDATED",
    ANNOUNCEMENT = "ANNOUNCEMENT"
}
export type NotificationDeliveryStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'unavailable';
export declare class Notification {
    id: string;
    recipient: Relation<User>;
    type: NotificationType;
    title: string;
    body: string;
    relatedEntityId: string | null;
    metadata: Record<string, string | number | boolean> | null;
    eventKey: string | null;
    readAt: Date | null;
    deliveryStatus: NotificationDeliveryStatus;
    deliveredAt: Date | null;
    deliveryErrorCode: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DeviceToken {
    id: string;
    user: Relation<User>;
    token: string;
    platform: 'ANDROID' | 'IOS';
    deviceName: string | null;
    isActive: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
