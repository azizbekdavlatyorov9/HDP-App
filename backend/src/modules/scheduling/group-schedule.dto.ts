import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class GroupScheduleEntryDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(7) weekday!: number;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/) startTime!: string;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/) endTime!: string;
  @IsUUID() classroomId!: string;
  @IsOptional() @IsDateString() effectiveStartDate?: string;
  @IsOptional() @IsDateString() effectiveEndDate?: string | null;
  @IsOptional() @IsString() @MaxLength(64) timezone?: string;
}

export class ReplaceGroupScheduleDto {
  @IsArray() @ArrayNotEmpty() @ArrayMaxSize(14) @ValidateNested({ each: true })
  @Type(() => GroupScheduleEntryDto)
  schedules!: GroupScheduleEntryDto[];
}
