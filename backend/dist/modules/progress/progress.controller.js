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
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProgressService } from './progress.service.js';
import { WatchProgressDto } from './progress.dto.js';
let ProgressController = class ProgressController {
    service;
    constructor(service) {
        this.service = service;
    }
    watch(id, d, u) { return this.service.watch(id, d.watchedSecondsDelta, u); }
    complete(id, u) { return this.service.complete(id, u); }
    mine(u) { return this.service.mine(u); }
    overview(id, u) { return this.service.overview(id, u); }
    forStudent(c, id, u) { return this.service.forCourse(c, id, u); }
};
__decorate([
    Post('lessons/:id/progress'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, WatchProgressDto, Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "watch", null);
__decorate([
    Post('lessons/:id/complete'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "complete", null);
__decorate([
    Get('progress/me'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "mine", null);
__decorate([
    Get('courses/:courseId/progress'),
    __param(0, Param('courseId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "overview", null);
__decorate([
    Get('courses/:courseId/progress/:userId'),
    __param(0, Param('courseId')),
    __param(1, Param('userId')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "forStudent", null);
ProgressController = __decorate([
    ApiTags('Progress'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller(),
    __metadata("design:paramtypes", [ProgressService])
], ProgressController);
export { ProgressController };
//# sourceMappingURL=progress.controller.js.map