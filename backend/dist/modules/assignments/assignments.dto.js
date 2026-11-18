var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, Matches } from 'class-validator';
export class AssignmentCreateDto {
    title;
    description;
    instructions;
    courseId;
    lessonId;
    groupId;
    maxScore;
    dueAt;
    allowLateSubmission;
    allowResubmission;
    allowResubmissionAfterGraded;
}
__decorate([
    ApiProperty({ maxLength: 180 }),
    IsString(),
    MinLength(1),
    MaxLength(180),
    __metadata("design:type", String)
], AssignmentCreateDto.prototype, "title", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    MinLength(1),
    MaxLength(20000),
    __metadata("design:type", String)
], AssignmentCreateDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({ maxLength: 20000 }),
    IsOptional(),
    IsString(),
    MaxLength(20000),
    __metadata("design:type", String)
], AssignmentCreateDto.prototype, "instructions", void 0);
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], AssignmentCreateDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AssignmentCreateDto.prototype, "lessonId", void 0);
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], AssignmentCreateDto.prototype, "groupId", void 0);
__decorate([
    ApiProperty({ minimum: 0.01, maximum: 1000000, example: 100 }),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0.01),
    Max(1000000),
    __metadata("design:type", Number)
], AssignmentCreateDto.prototype, "maxScore", void 0);
__decorate([
    ApiPropertyOptional({ type: String, format: 'date-time' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", Object)
], AssignmentCreateDto.prototype, "dueAt", void 0);
__decorate([
    ApiPropertyOptional({ default: false }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], AssignmentCreateDto.prototype, "allowLateSubmission", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], AssignmentCreateDto.prototype, "allowResubmission", void 0);
__decorate([
    ApiPropertyOptional({ default: false }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], AssignmentCreateDto.prototype, "allowResubmissionAfterGraded", void 0);
export class AssignmentUpdateDto extends PartialType(AssignmentCreateDto) {
}
export class AssignmentStatusDto {
    status;
}
__decorate([
    ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] }),
    IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    __metadata("design:type", String)
], AssignmentStatusDto.prototype, "status", void 0);
export class AssignmentListDto {
    page = 1;
    limit = 20;
    groupId;
    courseId;
    status;
    submissionStatus;
    deadline;
}
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], AssignmentListDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20, maximum: 100 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Object)
], AssignmentListDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AssignmentListDto.prototype, "groupId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AssignmentListDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] }),
    IsOptional(),
    IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    __metadata("design:type", String)
], AssignmentListDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['NOT_SUBMITTED', 'SUBMITTED', 'LATE', 'GRADED', 'RETURNED'] }),
    IsOptional(),
    IsIn(['NOT_SUBMITTED', 'SUBMITTED', 'LATE', 'GRADED', 'RETURNED']),
    __metadata("design:type", String)
], AssignmentListDto.prototype, "submissionStatus", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['upcoming', 'overdue', 'no_deadline'] }),
    IsOptional(),
    IsIn(['upcoming', 'overdue', 'no_deadline']),
    __metadata("design:type", String)
], AssignmentListDto.prototype, "deadline", void 0);
export class SubmissionListDto {
    page = 1;
    limit = 20;
    status;
}
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], SubmissionListDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20, maximum: 100 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Object)
], SubmissionListDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['SUBMITTED', 'LATE', 'GRADED', 'RETURNED'] }),
    IsOptional(),
    IsIn(['SUBMITTED', 'LATE', 'GRADED', 'RETURNED']),
    __metadata("design:type", String)
], SubmissionListDto.prototype, "status", void 0);
export class AssignmentSubmissionDto {
    idempotencyKey;
    textAnswer;
}
__decorate([
    ApiProperty({ minLength: 8, maxLength: 100 }),
    IsString(),
    MinLength(8),
    MaxLength(100),
    __metadata("design:type", String)
], AssignmentSubmissionDto.prototype, "idempotencyKey", void 0);
__decorate([
    ApiPropertyOptional({ maxLength: 30000 }),
    IsOptional(),
    IsString(),
    MaxLength(30000),
    __metadata("design:type", Object)
], AssignmentSubmissionDto.prototype, "textAnswer", void 0);
export class GradeSubmissionDto {
    score;
    feedback;
}
__decorate([
    ApiProperty({ minimum: 0, maximum: 1000000, example: 87.5 }),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(1000000),
    __metadata("design:type", Number)
], GradeSubmissionDto.prototype, "score", void 0);
__decorate([
    ApiProperty({ maxLength: 10000 }),
    IsString(),
    MaxLength(10000),
    __metadata("design:type", String)
], GradeSubmissionDto.prototype, "feedback", void 0);
export class ReturnSubmissionDto {
    feedback;
}
__decorate([
    ApiProperty({ minLength: 1, maxLength: 10000 }),
    IsString(),
    MinLength(1),
    MaxLength(10000),
    __metadata("design:type", String)
], ReturnSubmissionDto.prototype, "feedback", void 0);
export class AssignmentFileDto {
    fileName;
    mimeType;
    fileSize;
}
__decorate([
    ApiProperty({ maxLength: 255 }),
    IsString(),
    MinLength(1),
    MaxLength(255),
    Matches(/^[^/\\\0]+$/),
    __metadata("design:type", String)
], AssignmentFileDto.prototype, "fileName", void 0);
__decorate([
    ApiProperty({ maxLength: 120 }),
    IsString(),
    MaxLength(120),
    __metadata("design:type", String)
], AssignmentFileDto.prototype, "mimeType", void 0);
__decorate([
    ApiProperty({ minimum: 1, maximum: 52428800 }),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(52428800),
    __metadata("design:type", Number)
], AssignmentFileDto.prototype, "fileSize", void 0);
export class CompleteUploadDto extends AssignmentFileDto {
    uploadId;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], CompleteUploadDto.prototype, "uploadId", void 0);
//# sourceMappingURL=assignments.dto.js.map