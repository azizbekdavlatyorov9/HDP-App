import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateVideoUploadDto {
  @IsUUID()
  lessonId!: string;

  @IsInt()
  @Min(1)
  @Max(36000)
  maxDurationSeconds!: number;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;
}

export class VideoListQueryDto {
  @IsOptional()
  @IsUUID()
  lessonId?: string;
}

export class LegacyVideoUploadDto {
  @IsInt()
  @Min(1)
  @Max(14_400)
  maxDurationSeconds!: number;
}
