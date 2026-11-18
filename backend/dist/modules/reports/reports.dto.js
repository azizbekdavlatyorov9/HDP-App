var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, } from 'class-validator';
export class ReportQueryDto {
    from;
    to;
    timezone = 'Asia/Tashkent';
    page = 1;
    limit = 20;
    studentId;
    teacherId;
    groupId;
    courseId;
    assignmentId;
    search;
    status;
    paymentStatus;
    provider;
    submissionStatus;
    membershipStatus;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(40),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "from", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(40),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "to", void 0);
__decorate([
    ApiPropertyOptional({ default: 'Asia/Tashkent' }),
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", Object)
], ReportQueryDto.prototype, "timezone", void 0);
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], ReportQueryDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20, maximum: 100 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Object)
], ReportQueryDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "studentId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "teacherId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "groupId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "assignmentId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(120),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "search", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn([
        'pending',
        'processing',
        'succeeded',
        'failed',
        'refunded',
        'partially_refunded',
    ]),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "paymentStatus", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn(['payme', 'click']),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "provider", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn(['SUBMITTED', 'LATE', 'GRADED', 'RETURNED']),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "submissionStatus", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn(['ACTIVE', 'COMPLETED', 'LEFT', 'REMOVED']),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "membershipStatus", void 0);
export class DashboardQueryDto extends ReportQueryDto {
}
//# sourceMappingURL=reports.dto.js.map