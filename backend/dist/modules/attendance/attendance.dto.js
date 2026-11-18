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
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
export class AttendanceFieldsDto {
    status;
    latenessMinutes;
    reason;
    teacherNote;
}
__decorate([
    ApiProperty({ enum: ATTENDANCE_STATUSES }),
    IsIn(ATTENDANCE_STATUSES),
    __metadata("design:type", Object)
], AttendanceFieldsDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(1440),
    __metadata("design:type", Number)
], AttendanceFieldsDto.prototype, "latenessMinutes", void 0);
__decorate([
    ApiPropertyOptional({ maxLength: 1000 }),
    IsOptional(),
    IsString(),
    MaxLength(1000),
    __metadata("design:type", String)
], AttendanceFieldsDto.prototype, "reason", void 0);
__decorate([
    ApiPropertyOptional({ maxLength: 2000 }),
    IsOptional(),
    IsString(),
    MaxLength(2000),
    __metadata("design:type", String)
], AttendanceFieldsDto.prototype, "teacherNote", void 0);
export class AttendanceEntryDto extends AttendanceFieldsDto {
    studentId;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], AttendanceEntryDto.prototype, "studentId", void 0);
export class AttendanceBulkDto {
    records;
    changeReason;
}
__decorate([
    ApiProperty({ type: [AttendanceEntryDto], maxItems: 500 }),
    IsArray(),
    ArrayMinSize(1),
    ArrayMaxSize(500),
    ValidateNested({ each: true }),
    Type(() => AttendanceEntryDto),
    __metadata("design:type", Array)
], AttendanceBulkDto.prototype, "records", void 0);
__decorate([
    ApiPropertyOptional({ maxLength: 500 }),
    IsOptional(),
    IsString(),
    MaxLength(500),
    __metadata("design:type", String)
], AttendanceBulkDto.prototype, "changeReason", void 0);
export class AttendanceUpdateDto extends AttendanceFieldsDto {
    changeReason;
}
__decorate([
    ApiPropertyOptional({ maxLength: 500 }),
    IsOptional(),
    IsString(),
    MaxLength(500),
    __metadata("design:type", String)
], AttendanceUpdateDto.prototype, "changeReason", void 0);
export class ReopenAttendanceDto {
    reason;
}
__decorate([
    ApiProperty({ minLength: 3, maxLength: 500 }),
    IsString(),
    MinLength(3),
    MaxLength(500),
    __metadata("design:type", String)
], ReopenAttendanceDto.prototype, "reason", void 0);
export class AttendanceListDto {
    page = 1;
    limit = 20;
    studentId;
    teacherId;
    groupId;
    courseId;
    status;
    from;
    to;
    sessionId;
}
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], AttendanceListDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20, maximum: 100 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Object)
], AttendanceListDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AttendanceListDto.prototype, "studentId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AttendanceListDto.prototype, "teacherId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AttendanceListDto.prototype, "groupId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AttendanceListDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional({ enum: ATTENDANCE_STATUSES }),
    IsOptional(),
    IsIn(ATTENDANCE_STATUSES),
    __metadata("design:type", String)
], AttendanceListDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ format: 'date' }),
    IsOptional(),
    IsString(),
    MaxLength(10),
    __metadata("design:type", String)
], AttendanceListDto.prototype, "from", void 0);
__decorate([
    ApiPropertyOptional({ format: 'date' }),
    IsOptional(),
    IsString(),
    MaxLength(10),
    __metadata("design:type", String)
], AttendanceListDto.prototype, "to", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AttendanceListDto.prototype, "sessionId", void 0);
//# sourceMappingURL=attendance.dto.js.map