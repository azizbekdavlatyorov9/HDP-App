import { ApiProperty,ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Allow,IsDateString,IsIn,IsInt,IsOptional,IsString,IsUUID,Length,MaxLength } from 'class-validator';
import type { PaymentProviderName } from './payment-provider.js';
export class CreatePaymentDto { @ApiProperty() @IsUUID() courseId!:string; @ApiProperty({enum:['payme','click']}) @IsIn(['payme','click']) provider!:PaymentProviderName; @ApiProperty() @IsString() @Length(8,128) idempotencyKey!:string; }
export class AdminPaymentQueryDto { @ApiPropertyOptional() @IsOptional() @IsIn(['pending','processing','succeeded','failed','refunded','partially_refunded']) status?:string; @ApiPropertyOptional({enum:['payme','click']}) @IsOptional() @IsIn(['payme','click']) provider?:PaymentProviderName; @ApiPropertyOptional() @IsOptional() @IsUUID() userId?:string; @ApiPropertyOptional() @IsOptional() @IsDateString() from?:string; @ApiPropertyOptional() @IsOptional() @IsDateString() to?:string; @ApiPropertyOptional() @IsOptional() @IsString() page?:string; @ApiPropertyOptional() @IsOptional() @IsString() limit?:string; }
export class RefundDto { @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) reason?:string; }
export class PaymeRpcDto { @ApiProperty() @IsString() jsonrpc!:string; @ApiPropertyOptional() @IsOptional() id?:string|number|null; @ApiProperty() @IsString() method!:string; @ApiProperty() @Allow() params!:Record<string,unknown>; }
export class ClickCallbackDto {
 @ApiProperty() @Transform(({value})=>String(value)) @IsString() click_trans_id!:string; @ApiProperty() @Transform(({value})=>String(value)) @IsString() service_id!:string; @ApiProperty() @IsString() merchant_trans_id!:string;
 @ApiPropertyOptional() @IsOptional() @Transform(({value})=>String(value)) @IsString() merchant_prepare_id?:string; @ApiProperty() @Transform(({value})=>String(value)) @IsString() amount!:string; @ApiProperty() @Type(()=>Number) @IsInt() @IsIn([0,1]) action!:number;
 @ApiProperty() @IsString() sign_time!:string; @ApiProperty() @IsString() sign_string!:string;
 @ApiPropertyOptional() @IsOptional() @Type(()=>Number) @IsInt() error?:number; @ApiPropertyOptional() @IsOptional() @IsString() error_note?:string; @ApiPropertyOptional() @IsOptional() @Transform(({value})=>String(value)) @IsString() click_paydoc_id?:string;
}
