var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, Matches, Length } from 'class-validator';
export class RegisterDeviceDto {
    token;
    platform;
    deviceName;
}
__decorate([
    ApiProperty(),
    IsString(),
    MinLength(20),
    MaxLength(4096),
    Matches(/^\S+$/),
    __metadata("design:type", String)
], RegisterDeviceDto.prototype, "token", void 0);
__decorate([
    ApiProperty({ enum: ['ANDROID', 'IOS'] }),
    IsIn(['ANDROID', 'IOS']),
    __metadata("design:type", String)
], RegisterDeviceDto.prototype, "platform", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], RegisterDeviceDto.prototype, "deviceName", void 0);
export class RemoveDeviceDto {
    deviceId;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], RemoveDeviceDto.prototype, "deviceId", void 0);
export class NotificationListDto {
    page = 1;
    limit = 20;
    unread;
}
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], NotificationListDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20, maximum: 100 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Object)
], NotificationListDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn(['true', 'false']),
    __metadata("design:type", String)
], NotificationListDto.prototype, "unread", void 0);
export class AdminCreateNotificationDto {
    idempotencyKey;
    userIds;
    type;
    title;
    body;
    relatedEntityId;
    metadata;
}
__decorate([
    ApiProperty({ minLength: 8, maxLength: 128 }),
    IsString(),
    Length(8, 128),
    __metadata("design:type", String)
], AdminCreateNotificationDto.prototype, "idempotencyKey", void 0);
__decorate([
    ApiPropertyOptional({ type: [String], description: 'Omit to target all active users' }),
    IsOptional(),
    IsArray(),
    ArrayMaxSize(500),
    IsUUID('all', { each: true }),
    __metadata("design:type", Array)
], AdminCreateNotificationDto.prototype, "userIds", void 0);
__decorate([
    ApiProperty({ enum: ['GENERAL', 'COURSE_PUBLISHED', 'NEW_LESSON', 'LESSON_UPDATED', 'TEST_AVAILABLE', 'TEST_RESULT', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_CANCELLED', 'ENROLLMENT_CREATED', 'SCHEDULE_UPDATED', 'ANNOUNCEMENT'] }),
    IsIn(['GENERAL', 'COURSE_PUBLISHED', 'NEW_LESSON', 'LESSON_UPDATED', 'TEST_AVAILABLE', 'TEST_RESULT', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_CANCELLED', 'ENROLLMENT_CREATED', 'SCHEDULE_UPDATED', 'ANNOUNCEMENT']),
    __metadata("design:type", String)
], AdminCreateNotificationDto.prototype, "type", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    MinLength(1),
    MaxLength(160),
    __metadata("design:type", String)
], AdminCreateNotificationDto.prototype, "title", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    MinLength(1),
    MaxLength(1000),
    __metadata("design:type", String)
], AdminCreateNotificationDto.prototype, "body", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AdminCreateNotificationDto.prototype, "relatedEntityId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], AdminCreateNotificationDto.prototype, "metadata", void 0);
//# sourceMappingURL=notifications.dto.js.map