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
import { ArrayUnique, IsArray, IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString, IsUrl, Length, Matches, Min, } from 'class-validator';
export class CreateLessonDto {
    title;
    description;
    position;
    isFree;
    prerequisites;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 180),
    Matches(/\S/),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "description", void 0);
__decorate([
    ApiProperty(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "position", void 0);
__decorate([
    ApiProperty(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isFree", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    IsOptional(),
    IsArray(),
    ArrayUnique(),
    __metadata("design:type", Array)
], CreateLessonDto.prototype, "prerequisites", void 0);
export class UpdateLessonDto {
    title;
    description;
    isFree;
    orderIndex;
    videoUrl;
    materials;
    status;
    prerequisites;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(1, 180),
    Matches(/\S/),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateLessonDto.prototype, "isFree", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 0 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "orderIndex", void 0);
__decorate([
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    IsUrl({ require_tld: false }),
    __metadata("design:type", Object)
], UpdateLessonDto.prototype, "videoUrl", void 0);
__decorate([
    ApiPropertyOptional({ type: [Object], nullable: true }),
    IsOptional(),
    IsArray(),
    IsObject({ each: true }),
    __metadata("design:type", Object)
], UpdateLessonDto.prototype, "materials", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] }),
    IsOptional(),
    IsIn(['draft', 'published', 'archived']),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    IsOptional(),
    IsArray(),
    ArrayUnique(),
    __metadata("design:type", Array)
], UpdateLessonDto.prototype, "prerequisites", void 0);
export class CreateSubjectLessonDto {
    title;
    description;
    orderIndex;
    videoUrl;
    materials;
    status;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 180),
    Matches(/\S/),
    __metadata("design:type", String)
], CreateSubjectLessonDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateSubjectLessonDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ minimum: 0 }),
    Type(() => Number),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateSubjectLessonDto.prototype, "orderIndex", void 0);
__decorate([
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    IsUrl({ require_tld: false }),
    __metadata("design:type", Object)
], CreateSubjectLessonDto.prototype, "videoUrl", void 0);
__decorate([
    ApiPropertyOptional({ type: [Object], nullable: true }),
    IsOptional(),
    IsArray(),
    IsObject({ each: true }),
    __metadata("design:type", Object)
], CreateSubjectLessonDto.prototype, "materials", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] }),
    IsOptional(),
    IsIn(['draft', 'published', 'archived']),
    __metadata("design:type", String)
], CreateSubjectLessonDto.prototype, "status", void 0);
export class ReorderLessonsDto {
    lessonIds;
}
__decorate([
    ApiProperty({ type: [String] }),
    IsArray(),
    ArrayUnique(),
    __metadata("design:type", Array)
], ReorderLessonsDto.prototype, "lessonIds", void 0);
//# sourceMappingURL=lessons.dto.js.map