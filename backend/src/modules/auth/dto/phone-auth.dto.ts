import { IsString, Matches, MaxLength } from 'class-validator';

export class RequestPhoneCodeDto {
  @IsString()
  @MaxLength(32)
  phoneNumber!: string;
}

export class VerifyPhoneCodeDto extends RequestPhoneCodeDto {
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
