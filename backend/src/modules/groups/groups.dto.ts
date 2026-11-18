import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, MaxLength, Min } from 'class-validator';

export class GroupCreateDto {
  @ApiProperty() @IsString() @Length(1, 140) name!: string;
  @ApiProperty() @IsString() @Length(2, 40) code!: string;
  @ApiProperty() @IsUUID() courseId!: string;
  @ApiProperty() @IsUUID() teacherId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) @Max(500) capacity!: number;
  @ApiProperty() @IsDateString() startDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}
export class GroupUpdateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 140) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 40) code?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() courseId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() teacherId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) capacity?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string | null;
}
export class GroupStatusDto { @ApiProperty({ enum: ['DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED'] }) @IsIn(['DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED']) status!: string; }
export class AddStudentDto { @ApiProperty() @IsUUID() studentId!: string; }
export class AddEnrollmentToGroupDto { @ApiProperty() @IsUUID() enrollmentId!: string; }
export class AssignGroupTeacherDto { @ApiProperty() @IsUUID() teacherId!: string; }
export class MembershipStatusDto { @ApiProperty({ enum: ['ACTIVE','COMPLETED','LEFT','REMOVED'] }) @IsIn(['ACTIVE','COMPLETED','LEFT','REMOVED']) status!: string; }
export class GroupListDto { @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1; @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20; }
