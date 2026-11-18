import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{40,100}$/)
  @MaxLength(100)
  refreshToken!: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{40,100}$/)
  @MaxLength(100)
  refreshToken?: string;
}
