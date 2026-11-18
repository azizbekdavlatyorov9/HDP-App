import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';
export class ClassroomCreateDto { @ApiProperty() @IsString() @Length(1,140) name!:string; @ApiProperty() @IsString() @Length(2,40) code!:string; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) location?:string; @ApiProperty() @Type(()=>Number) @IsInt() @Min(1) @Max(1000) capacity!:number; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?:string; }
export class ClassroomUpdateDto { @ApiPropertyOptional() @IsOptional() @IsString() @Length(1,140) name?:string; @ApiPropertyOptional() @IsOptional() @IsString() @Length(2,40) code?:string; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) location?:string; @ApiPropertyOptional() @IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(1000) capacity?:number; @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?:string; }
export class ClassroomStatusDto { @ApiProperty() @IsBoolean() isActive!:boolean; }
