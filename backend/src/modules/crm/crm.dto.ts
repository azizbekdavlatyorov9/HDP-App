import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, MaxLength, Min } from 'class-validator';
import type { CrmActivityType, CrmLeadSource, CrmLeadStatus, TrialLessonStatus } from '../../database/entities/crm.entity.js';

export class CreateLeadDto {
  @ApiProperty() @IsString() @Length(1,160) fullName!:string;
  @ApiProperty({example:'+12025550123'}) @IsString() @Length(8,20) phoneNumber!:string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(254) email?:string;
  @ApiProperty({enum:['WEBSITE','PHONE','TELEGRAM','INSTAGRAM','REFERRAL','WALK_IN','OTHER']}) @IsIn(['WEBSITE','PHONE','TELEGRAM','INSTAGRAM','REFERRAL','WALK_IN','OTHER']) source!:CrmLeadSource;
  @ApiPropertyOptional() @IsOptional() @IsUUID() interestedCourseId?:string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedToUserId?:string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) notes?:string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextFollowUpAt?:string;
}
export class UpdateLeadDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1,160) fullName?:string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(8,20) phoneNumber?:string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(254) email?:string|null;
  @ApiPropertyOptional() @IsOptional() @IsUUID() interestedCourseId?:string|null;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedToUserId?:string|null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) notes?:string|null;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextFollowUpAt?:string|null;
}
export class ChangeLeadStatusDto { @ApiProperty({enum:['CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','LOST']}) @IsIn(['CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','LOST']) status!:CrmLeadStatus; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) reason?:string; }
export class CreateActivityDto { @ApiProperty({enum:['CALL','MESSAGE','EMAIL','MEETING','NOTE','OTHER']}) @IsIn(['CALL','MESSAGE','EMAIL','MEETING','NOTE','OTHER']) type!:CrmActivityType; @ApiProperty() @IsString() @Length(1,3000) description!:string; }
export class LeadListDto { @ApiPropertyOptional({default:1}) @IsOptional() @Type(()=>Number) @IsInt() @Min(1) page=1; @ApiPropertyOptional({default:20}) @IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(100) limit=20; @ApiPropertyOptional() @IsOptional() @IsIn(['NEW','CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','WON','LOST']) status?:CrmLeadStatus; @ApiPropertyOptional() @IsOptional() @IsIn(['WEBSITE','PHONE','TELEGRAM','INSTAGRAM','REFERRAL','WALK_IN','OTHER']) source?:CrmLeadSource; @ApiPropertyOptional() @IsOptional() @IsUUID() assignedToUserId?:string; @ApiPropertyOptional() @IsOptional() @IsUUID() courseId?:string; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) search?:string; @ApiPropertyOptional() @IsOptional() @IsDateString() followUpBefore?:string; }
export class TrialCreateDto { @ApiProperty() @IsUUID() courseId!:string; @ApiPropertyOptional() @IsOptional() @IsUUID() groupId?:string; @ApiPropertyOptional() @IsOptional() @IsUUID() sessionId?:string; @ApiProperty() @IsDateString() scheduledAt!:string; }
export class TrialUpdateDto { @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledAt?:string; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) result?:string|null; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) feedback?:string|null; }
export class TrialStatusDto { @ApiProperty({enum:['CONFIRMED','ATTENDED','MISSED','CANCELLED']}) @IsIn(['CONFIRMED','ATTENDED','MISSED','CANCELLED']) status!:TrialLessonStatus; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) reason?:string; }
export class ConvertLeadDto { @ApiPropertyOptional() @IsOptional() @IsUUID() groupId?:string; @ApiPropertyOptional() @IsOptional() @IsUUID() courseId?:string; }
