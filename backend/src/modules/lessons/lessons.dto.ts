import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty() @IsString() @Length(1, 180) @Matches(/\S/) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) position!: number;
  @ApiProperty() @IsBoolean() isFree!: boolean;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  prerequisites?: string[];
}

export class UpdateLessonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 180)
  @Matches(/\S/)
  title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFree?: boolean;
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderIndex?: number;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  videoUrl?: string | null;
  @ApiPropertyOptional({ type: [Object], nullable: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  materials?: Record<string, unknown>[] | null;
  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  prerequisites?: string[];
}

export class CreateSubjectLessonDto {
  @ApiProperty() @IsString() @Length(1, 180) @Matches(/\S/) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderIndex!: number;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  videoUrl?: string | null;
  @ApiPropertyOptional({ type: [Object], nullable: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  materials?: Record<string, unknown>[] | null;
  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';
}

export class ReorderLessonsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayUnique()
  lessonIds!: string[];
}
