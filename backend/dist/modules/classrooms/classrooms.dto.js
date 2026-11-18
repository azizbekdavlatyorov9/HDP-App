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
import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';
export class ClassroomCreateDto {
    name;
    code;
    location;
    capacity;
    description;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 140),
    __metadata("design:type", String)
], ClassroomCreateDto.prototype, "name", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    Length(2, 40),
    __metadata("design:type", String)
], ClassroomCreateDto.prototype, "code", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], ClassroomCreateDto.prototype, "location", void 0);
__decorate([
    ApiProperty(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(1000),
    __metadata("design:type", Number)
], ClassroomCreateDto.prototype, "capacity", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(2000),
    __metadata("design:type", String)
], ClassroomCreateDto.prototype, "description", void 0);
export class ClassroomUpdateDto {
    name;
    code;
    location;
    capacity;
    description;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(1, 140),
    __metadata("design:type", String)
], ClassroomUpdateDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(2, 40),
    __metadata("design:type", String)
], ClassroomUpdateDto.prototype, "code", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], ClassroomUpdateDto.prototype, "location", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(1000),
    __metadata("design:type", Number)
], ClassroomUpdateDto.prototype, "capacity", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(2000),
    __metadata("design:type", String)
], ClassroomUpdateDto.prototype, "description", void 0);
export class ClassroomStatusDto {
    isActive;
}
__decorate([
    ApiProperty(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], ClassroomStatusDto.prototype, "isActive", void 0);
//# sourceMappingURL=classrooms.dto.js.map