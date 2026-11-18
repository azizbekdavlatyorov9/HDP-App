var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsDateString, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, ValidateNested, } from 'class-validator';
export class GroupScheduleEntryDto {
    weekday;
    startTime;
    endTime;
    classroomId;
    effectiveStartDate;
    effectiveEndDate;
    timezone;
}
__decorate([
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(7),
    __metadata("design:type", Number)
], GroupScheduleEntryDto.prototype, "weekday", void 0);
__decorate([
    Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    __metadata("design:type", String)
], GroupScheduleEntryDto.prototype, "startTime", void 0);
__decorate([
    Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    __metadata("design:type", String)
], GroupScheduleEntryDto.prototype, "endTime", void 0);
__decorate([
    IsUUID(),
    __metadata("design:type", String)
], GroupScheduleEntryDto.prototype, "classroomId", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], GroupScheduleEntryDto.prototype, "effectiveStartDate", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", Object)
], GroupScheduleEntryDto.prototype, "effectiveEndDate", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], GroupScheduleEntryDto.prototype, "timezone", void 0);
export class ReplaceGroupScheduleDto {
    schedules;
}
__decorate([
    IsArray(),
    ArrayNotEmpty(),
    ArrayMaxSize(14),
    ValidateNested({ each: true }),
    Type(() => GroupScheduleEntryDto),
    __metadata("design:type", Array)
], ReplaceGroupScheduleDto.prototype, "schedules", void 0);
//# sourceMappingURL=group-schedule.dto.js.map