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
import { IsDateString, IsEmail, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, MaxLength, Min } from 'class-validator';
export class CreateLeadDto {
    fullName;
    phoneNumber;
    email;
    source;
    interestedCourseId;
    assignedToUserId;
    notes;
    nextFollowUpAt;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 160),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "fullName", void 0);
__decorate([
    ApiProperty({ example: '+12025550123' }),
    IsString(),
    Length(8, 20),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "phoneNumber", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsEmail(),
    MaxLength(254),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ enum: ['WEBSITE', 'PHONE', 'TELEGRAM', 'INSTAGRAM', 'REFERRAL', 'WALK_IN', 'OTHER'] }),
    IsIn(['WEBSITE', 'PHONE', 'TELEGRAM', 'INSTAGRAM', 'REFERRAL', 'WALK_IN', 'OTHER']),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "source", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "interestedCourseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "assignedToUserId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(5000),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "notes", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "nextFollowUpAt", void 0);
export class UpdateLeadDto {
    fullName;
    phoneNumber;
    email;
    interestedCourseId;
    assignedToUserId;
    notes;
    nextFollowUpAt;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(1, 160),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "fullName", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(8, 20),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "phoneNumber", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsEmail(),
    MaxLength(254),
    __metadata("design:type", Object)
], UpdateLeadDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", Object)
], UpdateLeadDto.prototype, "interestedCourseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", Object)
], UpdateLeadDto.prototype, "assignedToUserId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(5000),
    __metadata("design:type", Object)
], UpdateLeadDto.prototype, "notes", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", Object)
], UpdateLeadDto.prototype, "nextFollowUpAt", void 0);
export class ChangeLeadStatusDto {
    status;
    reason;
}
__decorate([
    ApiProperty({ enum: ['CONTACTED', 'INTERESTED', 'TRIAL_SCHEDULED', 'TRIAL_COMPLETED', 'NEGOTIATION', 'LOST'] }),
    IsIn(['CONTACTED', 'INTERESTED', 'TRIAL_SCHEDULED', 'TRIAL_COMPLETED', 'NEGOTIATION', 'LOST']),
    __metadata("design:type", String)
], ChangeLeadStatusDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(1000),
    __metadata("design:type", String)
], ChangeLeadStatusDto.prototype, "reason", void 0);
export class CreateActivityDto {
    type;
    description;
}
__decorate([
    ApiProperty({ enum: ['CALL', 'MESSAGE', 'EMAIL', 'MEETING', 'NOTE', 'OTHER'] }),
    IsIn(['CALL', 'MESSAGE', 'EMAIL', 'MEETING', 'NOTE', 'OTHER']),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "type", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 3000),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "description", void 0);
export class LeadListDto {
    page = 1;
    limit = 20;
    status;
    source;
    assignedToUserId;
    courseId;
    search;
    followUpBefore;
}
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], LeadListDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Object)
], LeadListDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn(['NEW', 'CONTACTED', 'INTERESTED', 'TRIAL_SCHEDULED', 'TRIAL_COMPLETED', 'NEGOTIATION', 'WON', 'LOST']),
    __metadata("design:type", String)
], LeadListDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn(['WEBSITE', 'PHONE', 'TELEGRAM', 'INSTAGRAM', 'REFERRAL', 'WALK_IN', 'OTHER']),
    __metadata("design:type", String)
], LeadListDto.prototype, "source", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], LeadListDto.prototype, "assignedToUserId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], LeadListDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(160),
    __metadata("design:type", String)
], LeadListDto.prototype, "search", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], LeadListDto.prototype, "followUpBefore", void 0);
export class TrialCreateDto {
    courseId;
    groupId;
    sessionId;
    scheduledAt;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], TrialCreateDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], TrialCreateDto.prototype, "groupId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], TrialCreateDto.prototype, "sessionId", void 0);
__decorate([
    ApiProperty(),
    IsDateString(),
    __metadata("design:type", String)
], TrialCreateDto.prototype, "scheduledAt", void 0);
export class TrialUpdateDto {
    scheduledAt;
    result;
    feedback;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], TrialUpdateDto.prototype, "scheduledAt", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(2000),
    __metadata("design:type", Object)
], TrialUpdateDto.prototype, "result", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(5000),
    __metadata("design:type", Object)
], TrialUpdateDto.prototype, "feedback", void 0);
export class TrialStatusDto {
    status;
    reason;
}
__decorate([
    ApiProperty({ enum: ['CONFIRMED', 'ATTENDED', 'MISSED', 'CANCELLED'] }),
    IsIn(['CONFIRMED', 'ATTENDED', 'MISSED', 'CANCELLED']),
    __metadata("design:type", String)
], TrialStatusDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(1000),
    __metadata("design:type", String)
], TrialStatusDto.prototype, "reason", void 0);
export class ConvertLeadDto {
    groupId;
    courseId;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ConvertLeadDto.prototype, "groupId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], ConvertLeadDto.prototype, "courseId", void 0);
//# sourceMappingURL=crm.dto.js.map