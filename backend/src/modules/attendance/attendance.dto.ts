import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

export const ATTENDANCE_STATUSES = ['PRESENT','ABSENT','LATE','EXCUSED'] as const;
export class AttendanceFieldsDto {
  @ApiProperty({ enum: ATTENDANCE_STATUSES }) @IsIn(ATTENDANCE_STATUSES) status!: typeof ATTENDANCE_STATUSES[number];
  @ApiPropertyOptional({ minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1440) latenessMinutes?: number;
  @ApiPropertyOptional({ maxLength: 1000 }) @IsOptional() @IsString() @MaxLength(1000) reason?: string;
  @ApiPropertyOptional({ maxLength: 2000 }) @IsOptional() @IsString() @MaxLength(2000) teacherNote?: string;
}
export class AttendanceEntryDto extends AttendanceFieldsDto { @ApiProperty() @IsUUID() studentId!: string; }
export class AttendanceBulkDto {
  @ApiProperty({ type: [AttendanceEntryDto], maxItems: 500 }) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500) @ValidateNested({ each: true }) @Type(() => AttendanceEntryDto) records!: AttendanceEntryDto[];
  @ApiPropertyOptional({ maxLength: 500 }) @IsOptional() @IsString() @MaxLength(500) changeReason?: string;
}
export class AttendanceUpdateDto extends AttendanceFieldsDto { @ApiPropertyOptional({ maxLength: 500 }) @IsOptional() @IsString() @MaxLength(500) changeReason?: string; }
export class ReopenAttendanceDto { @ApiProperty({ minLength: 3, maxLength: 500 }) @IsString() @MinLength(3) @MaxLength(500) reason!: string; }
export class AttendanceListDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
  @ApiPropertyOptional() @IsOptional() @IsUUID() studentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() teacherId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() groupId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() courseId?: string;
  @ApiPropertyOptional({ enum: ATTENDANCE_STATUSES }) @IsOptional() @IsIn(ATTENDANCE_STATUSES) status?: string;
  @ApiPropertyOptional({ format: 'date' }) @IsOptional() @IsString() @MaxLength(10) from?: string;
  @ApiPropertyOptional({ format: 'date' }) @IsOptional() @IsString() @MaxLength(10) to?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sessionId?: string;
}
