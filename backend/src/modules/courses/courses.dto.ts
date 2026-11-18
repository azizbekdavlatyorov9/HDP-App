import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @Length(1, 180)
  @Matches(/\S/)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  image?: string | null;

  // thumbnailUrl is kept for clients using the earlier Courses API.
  @ApiPropertyOptional({ deprecated: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @ValidateIf((dto: CreateCourseDto) => dto.priceMinor === undefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  price?: number;

  @ApiPropertyOptional({ deprecated: true })
  @ValidateIf((dto: CreateCourseDto) => dto.price === undefined)
  @Matches(/^\d+$/)
  priceMinor?: string;

  @ApiPropertyOptional({ default: 'UZS' })
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({
    minimum: 1,
    description:
      'Positive duration value; unit is defined by the course catalog.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ deprecated: true })
  @IsOptional()
  @IsString()
  leadTeacherId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  categoryIds?: string[];
}

export class UpdateCourseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 180)
  @Matches(/\S/)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  image?: string | null;

  @ApiPropertyOptional({ deprecated: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  price?: number;

  @ApiPropertyOptional({ deprecated: true })
  @IsOptional()
  @Matches(/^\d+$/)
  priceMinor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  categoryIds?: string[];
}

export class ListCoursesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ enum: ['createdAt', 'title'] })
  @IsOptional()
  @IsIn(['createdAt', 'title'])
  sort: 'createdAt' | 'title' = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';
}

export class CategoryDto {
  @ApiProperty()
  @IsString()
  @Length(1, 120)
  name!: string;

  @ApiProperty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(140)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateCategoryDto extends CategoryDto {}

export class CourseResponseDto {
  id!: string;
  title!: string;
  slug!: string;
  description!: string | null;
  image!: string | null;
  thumbnailUrl!: string | null;
  price!: number;
  priceMinor!: string;
  currency!: string;
  duration!: number | null;
  status!: 'active' | 'inactive';
  lifecycleStatus!: 'draft' | 'published' | 'archived';
  leadTeacher!: { id: string; displayName: string };
  categories!: { id: string; name: string; slug: string }[];
  createdAt!: Date;
  updatedAt!: Date;
}
