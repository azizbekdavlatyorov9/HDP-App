import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';
export class ScheduleCreateDto {
 @ApiProperty() @IsUUID() groupId!:string; @ApiProperty() @Type(()=>Number) @IsInt() @Min(0) @Max(6) weekday!:number;
 @ApiProperty({example:'09:00'}) @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/) startTime!:string;
 @ApiProperty({example:'10:30'}) @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/) endTime!:string;
 @ApiProperty() @IsDateString() effectiveStartDate!:string; @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveEndDate?:string;
 @ApiProperty() @IsUUID() classroomId!:string; @ApiPropertyOptional() @IsOptional() @IsUUID() teacherId?:string;
 @ApiPropertyOptional({default:'Asia/Tashkent'}) @IsOptional() @IsString() @MaxLength(64) timezone?:string;
}
export class ScheduleUpdateDto {
 @ApiPropertyOptional() @IsOptional() @Type(()=>Number) @IsInt() @Min(0) @Max(6) weekday?:number;
 @ApiPropertyOptional() @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/) startTime?:string;
 @ApiPropertyOptional() @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/) endTime?:string;
 @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveStartDate?:string; @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveEndDate?:string|null;
 @ApiPropertyOptional() @IsOptional() @IsUUID() classroomId?:string; @ApiPropertyOptional() @IsOptional() @IsUUID() teacherId?:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64) timezone?:string;
}
export class ScheduleStatusDto { @ApiProperty() @IsIn([true,false]) isActive!:boolean; }
export class GenerateSessionsDto { @ApiProperty() @IsDateString() from!:string; @ApiProperty() @IsDateString() to!:string; }
export class RescheduleSessionDto { @ApiProperty() @IsDateString() startAt!:string; @ApiProperty() @IsDateString() endAt!:string; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) note?:string; }
export class SessionStatusDto { @ApiProperty({enum:['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED']}) @IsIn(['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED']) status!:string; }
export class CancelSessionDto { @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) note?:string; }
