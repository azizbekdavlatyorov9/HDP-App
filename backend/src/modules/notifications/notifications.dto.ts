import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, Matches, Length } from 'class-validator';
import type { NotificationType } from '../../database/entities/notifications.entity.js';

export class RegisterDeviceDto {
  @ApiProperty() @IsString() @MinLength(20) @MaxLength(4096) @Matches(/^\S+$/) token!: string;
  @ApiProperty({ enum: ['ANDROID', 'IOS'] }) @IsIn(['ANDROID', 'IOS']) platform!: 'ANDROID' | 'IOS';
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) deviceName?: string;
}
export class RemoveDeviceDto { @ApiProperty() @IsUUID() deviceId!: string; }
export class NotificationListDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
  @ApiPropertyOptional() @IsOptional() @IsIn(['true', 'false']) unread?: string;
}
export class AdminCreateNotificationDto {
  @ApiProperty({ minLength: 8, maxLength: 128 }) @IsString() @Length(8, 128) idempotencyKey!: string;
  @ApiPropertyOptional({ type: [String], description: 'Omit to target all active users' }) @IsOptional() @IsArray() @ArrayMaxSize(500) @IsUUID('all', { each: true }) userIds?: string[];
  @ApiProperty({ enum: ['GENERAL','COURSE_PUBLISHED','NEW_LESSON','LESSON_UPDATED','TEST_AVAILABLE','TEST_RESULT','PAYMENT_SUCCESS','PAYMENT_FAILED','PAYMENT_CANCELLED','ENROLLMENT_CREATED','SCHEDULE_UPDATED','ANNOUNCEMENT'] }) @IsIn(['GENERAL','COURSE_PUBLISHED','NEW_LESSON','LESSON_UPDATED','TEST_AVAILABLE','TEST_RESULT','PAYMENT_SUCCESS','PAYMENT_FAILED','PAYMENT_CANCELLED','ENROLLMENT_CREATED','SCHEDULE_UPDATED','ANNOUNCEMENT']) type!: NotificationType;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(1000) body!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() relatedEntityId?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}
