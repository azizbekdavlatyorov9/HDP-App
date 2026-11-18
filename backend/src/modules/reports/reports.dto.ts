import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ReportQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) from?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) to?: string;
  @ApiPropertyOptional({ default: 'Asia/Tashkent' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone = 'Asia/Tashkent';
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
  @ApiPropertyOptional() @IsOptional() @IsUUID() studentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() teacherId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() groupId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() courseId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignmentId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'partially_refunded',
  ])
  paymentStatus?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['payme', 'click'])
  provider?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['SUBMITTED', 'LATE', 'GRADED', 'RETURNED'])
  submissionStatus?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['ACTIVE', 'COMPLETED', 'LEFT', 'REMOVED'])
  membershipStatus?: string;
}
export class DashboardQueryDto extends ReportQueryDto {}
