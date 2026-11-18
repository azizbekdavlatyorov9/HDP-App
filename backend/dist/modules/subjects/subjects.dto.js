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
import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';
export class CreateSubjectDto {
    title;
    description;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 180),
    Matches(/\S/),
    __metadata("design:type", String)
], CreateSubjectDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", Object)
], CreateSubjectDto.prototype, "description", void 0);
export class UpdateSubjectDto {
    title;
    description;
    status;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    Length(1, 180),
    Matches(/\S/),
    __metadata("design:type", String)
], UpdateSubjectDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    IsString(),
    __metadata("design:type", Object)
], UpdateSubjectDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['active', 'archived'] }),
    IsOptional(),
    IsIn(['active', 'archived']),
    __metadata("design:type", String)
], UpdateSubjectDto.prototype, "status", void 0);
//# sourceMappingURL=subjects.dto.js.map