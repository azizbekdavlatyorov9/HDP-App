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
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';
export class ScheduleCreateDto {
    groupId;
    weekday;
    startTime;
    endTime;
    effectiveStartDate;
    effectiveEndDate;
    classroomId;
    teacherId;
    timezone;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], ScheduleCreateDto.prototype, "groupId", void 0);
__decorate([
    ApiProperty(),
    Type(() => Number),
    IsInt(),
    Min(0),
    Max(6),
    __metadata("design:type", Number)
], ScheduleCreateDto.prototype, "weekday", void 0);
__decorate([
    ApiProperty({ example: '09:00' }),
    Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    __metadata("design:type", String)
], ScheduleCreateDto.prototype, "startTime", void 0);
__decorate([
    ApiProperty({ example: '10:30' }),
    Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    __metadata("design:type", String)
], ScheduleCreateDto.prototype, "endTime", void 0);
__decorate([
    ApiProperty(),
    IsDateString(),
    __metadata("design:type", String)
], ScheduleCreateDto.prototype, "effectiveStartDate", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], ScheduleCreateDto.prototype, "effectiveEndDate", void 0);
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], ScheduleCreateDto.prototype, "classroomId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ScheduleCreateDto.prototype, "teacherId", void 0);
__decorate([
    ApiPropertyOptional({ default: 'Asia/Tashkent' }),
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], ScheduleCreateDto.prototype, "timezone", void 0);
export class ScheduleUpdateDto {
    weekday;
    startTime;
    endTime;
    effectiveStartDate;
    effectiveEndDate;
    classroomId;
    teacherId;
    timezone;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(0),
    Max(6),
    __metadata("design:type", Number)
], ScheduleUpdateDto.prototype, "weekday", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    __metadata("design:type", String)
], ScheduleUpdateDto.prototype, "startTime", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    __metadata("design:type", String)
], ScheduleUpdateDto.prototype, "endTime", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], ScheduleUpdateDto.prototype, "effectiveStartDate", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", Object)
], ScheduleUpdateDto.prototype, "effectiveEndDate", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ScheduleUpdateDto.prototype, "classroomId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ScheduleUpdateDto.prototype, "teacherId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], ScheduleUpdateDto.prototype, "timezone", void 0);
export class ScheduleStatusDto {
    isActive;
}
__decorate([
    ApiProperty(),
    IsIn([true, false]),
    __metadata("design:type", Boolean)
], ScheduleStatusDto.prototype, "isActive", void 0);
export class GenerateSessionsDto {
    from;
    to;
}
__decorate([
    ApiProperty(),
    IsDateString(),
    __metadata("design:type", String)
], GenerateSessionsDto.prototype, "from", void 0);
__decorate([
    ApiProperty(),
    IsDateString(),
    __metadata("design:type", String)
], GenerateSessionsDto.prototype, "to", void 0);
export class RescheduleSessionDto {
    startAt;
    endAt;
    note;
}
__decorate([
    ApiProperty(),
    IsDateString(),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "startAt", void 0);
__decorate([
    ApiProperty(),
    IsDateString(),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "endAt", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(500),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "note", void 0);
export class SessionStatusDto {
    status;
}
__decorate([
    ApiProperty({ enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] }),
    IsIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    __metadata("design:type", String)
], SessionStatusDto.prototype, "status", void 0);
export class CancelSessionDto {
    note;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(500),
    __metadata("design:type", String)
], CancelSessionDto.prototype, "note", void 0);
//# sourceMappingURL=scheduling.dto.js.map