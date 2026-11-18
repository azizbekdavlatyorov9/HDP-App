import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, Matches } from 'class-validator';

export class AssignmentCreateDto {
  @ApiProperty({maxLength:180}) @IsString() @MinLength(1) @MaxLength(180) title!:string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(20000) description!:string;
  @ApiPropertyOptional({maxLength:20000}) @IsOptional() @IsString() @MaxLength(20000) instructions?:string;
  @ApiProperty() @IsUUID() courseId!:string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() lessonId?:string;
  @ApiProperty() @IsUUID() groupId!:string;
  @ApiProperty({minimum:0.01,maximum:1000000,example:100}) @Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) @Max(1000000) maxScore!:number;
  @ApiPropertyOptional({type:String,format:'date-time'}) @IsOptional() @IsDateString() dueAt?:string|null;
  @ApiPropertyOptional({default:false}) @IsOptional() @IsBoolean() allowLateSubmission?:boolean;
  @ApiPropertyOptional({default:true}) @IsOptional() @IsBoolean() allowResubmission?:boolean;
  @ApiPropertyOptional({default:false}) @IsOptional() @IsBoolean() allowResubmissionAfterGraded?:boolean;
}
export class AssignmentUpdateDto extends PartialType(AssignmentCreateDto) {}
export class AssignmentStatusDto { @ApiProperty({enum:['DRAFT','PUBLISHED','ARCHIVED']}) @IsIn(['DRAFT','PUBLISHED','ARCHIVED']) status!: 'DRAFT'|'PUBLISHED'|'ARCHIVED'; }
export class AssignmentListDto {
  @ApiPropertyOptional({default:1}) @IsOptional() @Type(()=>Number) @IsInt() @Min(1) page=1;
  @ApiPropertyOptional({default:20,maximum:100}) @IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(100) limit=20;
  @ApiPropertyOptional() @IsOptional() @IsUUID() groupId?:string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() courseId?:string;
  @ApiPropertyOptional({enum:['DRAFT','PUBLISHED','ARCHIVED']}) @IsOptional() @IsIn(['DRAFT','PUBLISHED','ARCHIVED']) status?:string;
  @ApiPropertyOptional({enum:['NOT_SUBMITTED','SUBMITTED','LATE','GRADED','RETURNED']}) @IsOptional() @IsIn(['NOT_SUBMITTED','SUBMITTED','LATE','GRADED','RETURNED']) submissionStatus?:string;
  @ApiPropertyOptional({enum:['upcoming','overdue','no_deadline']}) @IsOptional() @IsIn(['upcoming','overdue','no_deadline']) deadline?:string;
}
export class SubmissionListDto {
  @ApiPropertyOptional({default:1}) @IsOptional() @Type(()=>Number) @IsInt() @Min(1) page=1;
  @ApiPropertyOptional({default:20,maximum:100}) @IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(100) limit=20;
  @ApiPropertyOptional({enum:['SUBMITTED','LATE','GRADED','RETURNED']}) @IsOptional() @IsIn(['SUBMITTED','LATE','GRADED','RETURNED']) status?:string;
}
export class AssignmentSubmissionDto {
  @ApiProperty({minLength:8,maxLength:100}) @IsString() @MinLength(8) @MaxLength(100) idempotencyKey!:string;
  @ApiPropertyOptional({maxLength:30000}) @IsOptional() @IsString() @MaxLength(30000) textAnswer?:string|null;
}
export class GradeSubmissionDto { @ApiProperty({minimum:0,maximum:1000000,example:87.5}) @Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0) @Max(1000000) score!:number; @ApiProperty({maxLength:10000}) @IsString() @MaxLength(10000) feedback!:string; }
export class ReturnSubmissionDto { @ApiProperty({minLength:1,maxLength:10000}) @IsString() @MinLength(1) @MaxLength(10000) feedback!:string; }
export class AssignmentFileDto {
  @ApiProperty({maxLength:255}) @IsString() @MinLength(1) @MaxLength(255) @Matches(/^[^/\\\0]+$/) fileName!:string;
  @ApiProperty({maxLength:120}) @IsString() @MaxLength(120) mimeType!:string;
  @ApiProperty({minimum:1,maximum:52428800}) @Type(()=>Number) @IsInt() @Min(1) @Max(52428800) fileSize!:number;
}
export class CompleteUploadDto extends AssignmentFileDto { @ApiProperty() @IsUUID() uploadId!:string; }
