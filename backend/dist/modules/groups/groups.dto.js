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
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, MaxLength, Min } from 'class-validator';
export class GroupCreateDto {
    name;
    code;
    courseId;
    teacherId;
    description;
    capacity;
    startDate;
    endDate;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 140),
    __metadata("design:type", String)
], GroupCreateDto.prototype, "name", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    Length(2, 40),
    __metadata("design:type", String)
], GroupCreateDto.prototype, "code", void 0);
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], GroupCreateDto.prototype, "courseId", void 0);
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], GroupCreateDto.prototype, "teacherId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(2000),
    __metadata("design:type", String)
], GroupCreateDto.prototype, "description", void 0);
__decorate([
    ApiProperty(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(500),
    __metadata("design:type", Number)
], GroupCreateDto.prototype, "capacity", void 0);
__decorate([
    ApiProperty(),
    IsDateString(),
    __metadata("design:type", String)
], GroupCreateDto.prototype, "startDate", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], GroupCreateDto.prototype, "endDate", void 0);
export class GroupUpdateDto {
    name;
    code;
    courseId;
    teacherId;
    description;
    capacity;
    startDate;
    endDate;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(1, 140),
    __metadata("design:type", String)
], GroupUpdateDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(2, 40),
    __metadata("design:type", String)
], GroupUpdateDto.prototype, "code", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], GroupUpdateDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], GroupUpdateDto.prototype, "teacherId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(2000),
    __metadata("design:type", String)
], GroupUpdateDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(500),
    __metadata("design:type", Number)
], GroupUpdateDto.prototype, "capacity", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], GroupUpdateDto.prototype, "startDate", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", Object)
], GroupUpdateDto.prototype, "endDate", void 0);
export class GroupStatusDto {
    status;
}
__decorate([
    ApiProperty({ enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] }),
    IsIn(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']),
    __metadata("design:type", String)
], GroupStatusDto.prototype, "status", void 0);
export class AddStudentDto {
    studentId;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], AddStudentDto.prototype, "studentId", void 0);
export class AddEnrollmentToGroupDto {
    enrollmentId;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], AddEnrollmentToGroupDto.prototype, "enrollmentId", void 0);
export class AssignGroupTeacherDto {
    teacherId;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], AssignGroupTeacherDto.prototype, "teacherId", void 0);
export class MembershipStatusDto {
    status;
}
__decorate([
    ApiProperty({ enum: ['ACTIVE', 'COMPLETED', 'LEFT', 'REMOVED'] }),
    IsIn(['ACTIVE', 'COMPLETED', 'LEFT', 'REMOVED']),
    __metadata("design:type", String)
], MembershipStatusDto.prototype, "status", void 0);
export class GroupListDto {
    page = 1;
    limit = 20;
}
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], GroupListDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Object)
], GroupListDto.prototype, "limit", void 0);
//# sourceMappingURL=groups.dto.js.map