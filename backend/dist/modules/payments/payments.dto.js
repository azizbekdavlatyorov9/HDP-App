var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Allow, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';
export class CreatePaymentDto {
    courseId;
    provider;
    idempotencyKey;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "courseId", void 0);
__decorate([
    ApiProperty({ enum: ['payme', 'click'] }),
    IsIn(['payme', 'click']),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "provider", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    Length(8, 128),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "idempotencyKey", void 0);
export class AdminPaymentQueryDto {
    status;
    provider;
    userId;
    from;
    to;
    page;
    limit;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsIn(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded']),
    __metadata("design:type", String)
], AdminPaymentQueryDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['payme', 'click'] }),
    IsOptional(),
    IsIn(['payme', 'click']),
    __metadata("design:type", String)
], AdminPaymentQueryDto.prototype, "provider", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AdminPaymentQueryDto.prototype, "userId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], AdminPaymentQueryDto.prototype, "from", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], AdminPaymentQueryDto.prototype, "to", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AdminPaymentQueryDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AdminPaymentQueryDto.prototype, "limit", void 0);
export class RefundDto {
    reason;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(500),
    __metadata("design:type", String)
], RefundDto.prototype, "reason", void 0);
export class PaymeRpcDto {
    jsonrpc;
    id;
    method;
    params;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], PaymeRpcDto.prototype, "jsonrpc", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", Object)
], PaymeRpcDto.prototype, "id", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], PaymeRpcDto.prototype, "method", void 0);
__decorate([
    ApiProperty(),
    Allow(),
    __metadata("design:type", Object)
], PaymeRpcDto.prototype, "params", void 0);
export class ClickCallbackDto {
    click_trans_id;
    service_id;
    merchant_trans_id;
    merchant_prepare_id;
    amount;
    action;
    sign_time;
    sign_string;
    error;
    error_note;
    click_paydoc_id;
}
__decorate([
    ApiProperty(),
    Transform(({ value }) => String(value)),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "click_trans_id", void 0);
__decorate([
    ApiProperty(),
    Transform(({ value }) => String(value)),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "service_id", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "merchant_trans_id", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Transform(({ value }) => String(value)),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "merchant_prepare_id", void 0);
__decorate([
    ApiProperty(),
    Transform(({ value }) => String(value)),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "amount", void 0);
__decorate([
    ApiProperty(),
    Type(() => Number),
    IsInt(),
    IsIn([0, 1]),
    __metadata("design:type", Number)
], ClickCallbackDto.prototype, "action", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "sign_time", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "sign_string", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    __metadata("design:type", Number)
], ClickCallbackDto.prototype, "error", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "error_note", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Transform(({ value }) => String(value)),
    IsString(),
    __metadata("design:type", String)
], ClickCallbackDto.prototype, "click_paydoc_id", void 0);
//# sourceMappingURL=payments.dto.js.map