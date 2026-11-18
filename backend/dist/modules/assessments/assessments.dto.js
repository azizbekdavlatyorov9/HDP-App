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
import { ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator';
export class OptionDto {
    text;
    isCorrect;
}
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 500),
    __metadata("design:type", String)
], OptionDto.prototype, "text", void 0);
__decorate([
    ApiProperty(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], OptionDto.prototype, "isCorrect", void 0);
export class QuestionDto {
    prompt;
    points = 1;
    allowMultipleAnswers = false;
    options;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], QuestionDto.prototype, "prompt", void 0);
__decorate([
    ApiProperty(),
    IsInt(),
    Min(1),
    __metadata("design:type", Object)
], QuestionDto.prototype, "points", void 0);
__decorate([
    ApiProperty(),
    IsBoolean(),
    __metadata("design:type", Object)
], QuestionDto.prototype, "allowMultipleAnswers", void 0);
__decorate([
    ApiProperty({ type: [OptionDto] }),
    IsArray(),
    ArrayMinSize(2),
    ValidateNested({ each: true }),
    Type(() => OptionDto),
    __metadata("design:type", Array)
], QuestionDto.prototype, "options", void 0);
export class CreateTestDto {
    courseId;
    lessonId;
    title;
    description;
    passingScore = 60;
    timeLimitSeconds;
    attemptLimit;
    questions;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "lessonId", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    Length(1, 180),
    __metadata("design:type", String)
], CreateTestDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "description", void 0);
__decorate([
    ApiProperty(),
    IsInt(),
    Min(0),
    Max(100),
    __metadata("design:type", Object)
], CreateTestDto.prototype, "passingScore", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateTestDto.prototype, "timeLimitSeconds", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateTestDto.prototype, "attemptLimit", void 0);
__decorate([
    ApiProperty({ type: [QuestionDto] }),
    IsArray(),
    ArrayMinSize(1),
    ValidateNested({ each: true }),
    Type(() => QuestionDto),
    __metadata("design:type", Array)
], CreateTestDto.prototype, "questions", void 0);
export class SubmitAnswerDto {
    questionId;
    optionIds;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], SubmitAnswerDto.prototype, "questionId", void 0);
__decorate([
    ApiProperty({ type: [String] }),
    IsArray(),
    ArrayUnique(),
    IsUUID('4', { each: true }),
    __metadata("design:type", Array)
], SubmitAnswerDto.prototype, "optionIds", void 0);
export class SubmitTestDto {
    answers;
}
__decorate([
    ApiProperty({ type: [SubmitAnswerDto] }),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => SubmitAnswerDto),
    __metadata("design:type", Array)
], SubmitTestDto.prototype, "answers", void 0);
//# sourceMappingURL=assessments.dto.js.map