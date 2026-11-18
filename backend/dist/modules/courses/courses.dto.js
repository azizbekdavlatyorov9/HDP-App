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
import { ArrayUnique, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUrl, Length, Matches, Max, MaxLength, Min, ValidateIf, } from 'class-validator';
export class CreateCourseDto {
    title;
    slug;
    description;
    image;
    thumbnailUrl;
    price;
    priceMinor;
    currency;
    duration;
    status;
    leadTeacherId;
    categoryIds;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 180),
    Matches(/\S/),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    MaxLength(200),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    IsUrl({ require_tld: false }),
    __metadata("design:type", Object)
], CreateCourseDto.prototype, "image", void 0);
__decorate([
    ApiPropertyOptional({ deprecated: true }),
    IsOptional(),
    IsUrl({ require_tld: false }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "thumbnailUrl", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 0 }),
    ValidateIf((dto) => dto.priceMinor === undefined),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 0 }),
    Min(0),
    Max(Number.MAX_SAFE_INTEGER),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "price", void 0);
__decorate([
    ApiPropertyOptional({ deprecated: true }),
    ValidateIf((dto) => dto.price === undefined),
    Matches(/^\d+$/),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "priceMinor", void 0);
__decorate([
    ApiPropertyOptional({ default: 'UZS' }),
    IsOptional(),
    Length(3, 3),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "currency", void 0);
__decorate([
    ApiPropertyOptional({
        minimum: 1,
        description: 'Positive duration value; unit is defined by the course catalog.',
    }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "duration", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['active', 'inactive'] }),
    IsOptional(),
    IsIn(['active', 'inactive']),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ deprecated: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "leadTeacherId", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    IsOptional(),
    IsArray(),
    ArrayUnique(),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "categoryIds", void 0);
export class UpdateCourseDto {
    title;
    slug;
    description;
    image;
    thumbnailUrl;
    price;
    priceMinor;
    currency;
    duration;
    status;
    categoryIds;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(1, 180),
    Matches(/\S/),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    MaxLength(200),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    IsUrl({ require_tld: false }),
    __metadata("design:type", Object)
], UpdateCourseDto.prototype, "image", void 0);
__decorate([
    ApiPropertyOptional({ deprecated: true }),
    IsOptional(),
    IsUrl({ require_tld: false }),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "thumbnailUrl", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 0 }),
    IsOptional(),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 0 }),
    Min(0),
    Max(Number.MAX_SAFE_INTEGER),
    __metadata("design:type", Number)
], UpdateCourseDto.prototype, "price", void 0);
__decorate([
    ApiPropertyOptional({ deprecated: true }),
    IsOptional(),
    Matches(/^\d+$/),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "priceMinor", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Length(3, 3),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "currency", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], UpdateCourseDto.prototype, "duration", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['active', 'inactive'] }),
    IsOptional(),
    IsIn(['active', 'inactive']),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    IsOptional(),
    IsArray(),
    ArrayUnique(),
    __metadata("design:type", Array)
], UpdateCourseDto.prototype, "categoryIds", void 0);
export class ListCoursesDto {
    search;
    category;
    page = 1;
    limit = 20;
    sort = 'createdAt';
    order = 'DESC';
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], ListCoursesDto.prototype, "search", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ListCoursesDto.prototype, "category", void 0);
__decorate([
    ApiPropertyOptional({ default: 1 }),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], ListCoursesDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20 }),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Object)
], ListCoursesDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['createdAt', 'title'] }),
    IsOptional(),
    IsIn(['createdAt', 'title']),
    __metadata("design:type", String)
], ListCoursesDto.prototype, "sort", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['ASC', 'DESC'] }),
    IsOptional(),
    IsIn(['ASC', 'DESC']),
    __metadata("design:type", String)
], ListCoursesDto.prototype, "order", void 0);
export class CategoryDto {
    name;
    slug;
    description;
    parentId;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 120),
    __metadata("design:type", String)
], CategoryDto.prototype, "name", void 0);
__decorate([
    ApiProperty(),
    Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    MaxLength(140),
    __metadata("design:type", String)
], CategoryDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CategoryDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CategoryDto.prototype, "parentId", void 0);
export class UpdateCategoryDto extends CategoryDto {
}
export class CourseResponseDto {
    id;
    title;
    slug;
    description;
    image;
    thumbnailUrl;
    price;
    priceMinor;
    currency;
    duration;
    status;
    lifecycleStatus;
    leadTeacher;
    categories;
    createdAt;
    updatedAt;
}
//# sourceMappingURL=courses.dto.js.map