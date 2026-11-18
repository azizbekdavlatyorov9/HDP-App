var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './core.entity.js';
export var NotificationType;
(function (NotificationType) {
    NotificationType["GENERAL"] = "GENERAL";
    NotificationType["COURSE_PUBLISHED"] = "COURSE_PUBLISHED";
    NotificationType["NEW_LESSON"] = "NEW_LESSON";
    NotificationType["LESSON_UPDATED"] = "LESSON_UPDATED";
    NotificationType["TEST_AVAILABLE"] = "TEST_AVAILABLE";
    NotificationType["TEST_RESULT"] = "TEST_RESULT";
    NotificationType["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    NotificationType["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    NotificationType["PAYMENT_CANCELLED"] = "PAYMENT_CANCELLED";
    NotificationType["ENROLLMENT_CREATED"] = "ENROLLMENT_CREATED";
    NotificationType["SCHEDULE_UPDATED"] = "SCHEDULE_UPDATED";
    NotificationType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
})(NotificationType || (NotificationType = {}));
let Notification = class Notification {
    id;
    recipient;
    type;
    title;
    body;
    relatedEntityId;
    metadata;
    eventKey;
    readAt;
    deliveryStatus;
    deliveredAt;
    deliveryErrorCode;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'recipient_user_id' }),
    __metadata("design:type", Object)
], Notification.prototype, "recipient", void 0);
__decorate([
    Column({ type: 'varchar', length: 80 }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    Column({ type: 'varchar', length: 160 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    Column({ type: 'varchar', length: 1000 }),
    __metadata("design:type", String)
], Notification.prototype, "body", void 0);
__decorate([
    Column({ name: 'related_entity_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "relatedEntityId", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    Column({ name: 'event_key', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "eventKey", void 0);
__decorate([
    Column({ name: 'read_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "readAt", void 0);
__decorate([
    Column({ name: 'delivery_status', type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], Notification.prototype, "deliveryStatus", void 0);
__decorate([
    Column({ name: 'delivered_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "deliveredAt", void 0);
__decorate([
    Column({ name: 'delivery_error_code', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "deliveryErrorCode", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Notification.prototype, "updatedAt", void 0);
Notification = __decorate([
    Entity('notifications'),
    Check('CHK_notifications_type', `"type" IN (${Object.values(NotificationType).map((v) => `'${v}'`).join(', ')})`),
    Check('CHK_notifications_delivery_status', `"delivery_status" IN ('pending','sending','sent','failed','unavailable')`),
    Index('UQ_notifications_event_key', ['eventKey'], { unique: true }),
    Index('IDX_notifications_recipient_created', ['recipient', 'createdAt']),
    Index('IDX_notifications_recipient_read_created', ['recipient', 'readAt', 'createdAt'])
], Notification);
export { Notification };
let DeviceToken = class DeviceToken {
    id;
    user;
    token;
    platform;
    deviceName;
    isActive;
    lastSeenAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], DeviceToken.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], DeviceToken.prototype, "user", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], DeviceToken.prototype, "token", void 0);
__decorate([
    Column({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], DeviceToken.prototype, "platform", void 0);
__decorate([
    Column({ name: 'device_name', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], DeviceToken.prototype, "deviceName", void 0);
__decorate([
    Column({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], DeviceToken.prototype, "isActive", void 0);
__decorate([
    Column({ name: 'last_seen_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], DeviceToken.prototype, "lastSeenAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], DeviceToken.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], DeviceToken.prototype, "updatedAt", void 0);
DeviceToken = __decorate([
    Entity('device_tokens'),
    Check('CHK_device_tokens_platform', `"platform" IN ('ANDROID','IOS')`),
    Index('UQ_device_tokens_active_token', ['token'], { unique: true, where: '"is_active" = true' }),
    Index('IDX_device_tokens_user_active', ['user', 'isActive'])
], DeviceToken);
export { DeviceToken };
//# sourceMappingURL=notifications.entity.js.map