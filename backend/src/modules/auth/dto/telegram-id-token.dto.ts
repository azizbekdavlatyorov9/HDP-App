import { IsJWT, MaxLength } from 'class-validator';

export class TelegramIdTokenDto {
  @IsJWT()
  @MaxLength(10_000)
  idToken!: string;
}
