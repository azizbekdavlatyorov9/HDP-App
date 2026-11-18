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
import { Controller, Body, Get, HttpCode, HttpStatus, Post, Query, Res, } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TelegramOidcProbeService } from './telegram-oidc-probe.service.js';
const APP_CALLBACK_URI = 'hdpacademy://telegram-oidc-probe?complete=1';
let TelegramOidcProbeController = class TelegramOidcProbeController {
    probe;
    constructor(probe) {
        this.probe = probe;
    }
    start() {
        return this.probe.start();
    }
    result(probeId) {
        return { result: this.probe.getResult(probeId) };
    }
    async callback(code, state, response) {
        await this.probe.complete(code, state);
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('Referrer-Policy', 'no-referrer');
        response.redirect(HttpStatus.FOUND, APP_CALLBACK_URI);
    }
};
__decorate([
    Post('start'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 3, ttl: 60_000 } }),
    ApiOperation({ summary: 'Start a development-only Telegram OIDC verification probe.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TelegramOidcProbeController.prototype, "start", null);
__decorate([
    Post('result'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    ApiOperation({ summary: 'Read the short-lived PASS/FAIL result for a development probe.' }),
    __param(0, Body('probeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TelegramOidcProbeController.prototype, "result", null);
__decorate([
    Get('callback'),
    ApiOperation({ summary: 'Complete the development-only Telegram OIDC verification probe.' }),
    __param(0, Query('code')),
    __param(1, Query('state')),
    __param(2, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TelegramOidcProbeController.prototype, "callback", null);
TelegramOidcProbeController = __decorate([
    ApiTags('auth-telegram-oidc-probe'),
    Controller('auth/telegram/oidc-probe'),
    __metadata("design:paramtypes", [TelegramOidcProbeService])
], TelegramOidcProbeController);
export { TelegramOidcProbeController };
//# sourceMappingURL=telegram-oidc-probe.controller.js.map