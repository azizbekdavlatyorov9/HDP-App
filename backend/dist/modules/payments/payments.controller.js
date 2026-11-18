var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Headers, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminPaymentQueryDto, ClickCallbackDto, CreatePaymentDto, PaymeRpcDto, RefundDto } from './payments.dto.js';
import { PaymentsService } from './payments.service.js';
import { PaymeProvider } from './payme.provider.js';
import { ClickCallbackService } from './click-callback.service.js';
let PaymentsController = class PaymentsController {
    service;
    payme;
    click;
    constructor(service, payme, click) {
        this.service = service;
        this.payme = payme;
        this.click = click;
    }
    create(dto, u) { return this.service.create(dto, u); }
    mine(u, page, limit) { return this.service.mine(u, Math.max(1, Number(page) || 1), Math.min(100, Math.max(1, Number(limit) || 20))); }
    detail(id, u) { return this.service.ownDetail(id, u); }
    paymeCallback(auth, request) { if (!this.payme.verifyAuthorization(auth))
        return { jsonrpc: '2.0', id: request.id ?? null, error: { code: -32504, message: 'Insufficient privileges' } }; return this.service.paymeRpc(request); }
    clickPrepare(p) { return this.click.prepare(p); }
    clickComplete(p) { return this.click.complete(p); }
};
__decorate([
    Post(),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a course payment and receive provider checkout information' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePaymentDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
__decorate([
    Get('me'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'List the current user payment history' }),
    __param(0, CurrentUser()),
    __param(1, Query('page')),
    __param(2, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "mine", null);
__decorate([
    Get(':id'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'View one of the current user payments' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "detail", null);
__decorate([
    Post('callbacks/payme'),
    ApiOperation({ summary: 'Payme Merchant API JSON-RPC callback' }),
    __param(0, Headers('authorization')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, PaymeRpcDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "paymeCallback", null);
__decorate([
    Post('callbacks/click/prepare'),
    ApiOperation({ summary: 'Click Shop API Prepare callback' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ClickCallbackDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "clickPrepare", null);
__decorate([
    Post('callbacks/click/complete'),
    ApiOperation({ summary: 'Click Shop API Complete callback' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ClickCallbackDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "clickComplete", null);
PaymentsController = __decorate([
    ApiTags('Payments'),
    Controller('payments'),
    __metadata("design:paramtypes", [PaymentsService, PaymeProvider, ClickCallbackService])
], PaymentsController);
export { PaymentsController };
let AdminPaymentsController = class AdminPaymentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(q) { return this.service.adminList(q); }
    statistics() { return this.service.statistics(); }
    detail(id) { return this.service.adminDetail(id); }
    refund(id, d, u) { return this.service.refund(id, u, d.reason); }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Filter and paginate payments (administrators only)' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminPaymentQueryDto]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "list", null);
__decorate([
    Get('statistics'),
    ApiOperation({ summary: 'Payment totals grouped by status (administrators only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "statistics", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'View payment and provider transaction history (administrators only)' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "detail", null);
__decorate([
    Post(':id/refund'),
    ApiOperation({ summary: 'Initiate a provider supported refund (administrators only)' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RefundDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "refund", null);
AdminPaymentsController = __decorate([
    ApiTags('Admin payments'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    Controller('admin/payments'),
    __metadata("design:paramtypes", [PaymentsService])
], AdminPaymentsController);
export { AdminPaymentsController };
//# sourceMappingURL=payments.controller.js.map