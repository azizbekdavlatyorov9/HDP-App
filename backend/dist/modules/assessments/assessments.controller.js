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
import { AssessmentsService } from './assessments.service.js';
import { CreateTestDto, SubmitTestDto } from './assessments.dto.js';
let AssessmentsController = class AssessmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d, u) { return this.service.create(d, u); }
    publish(id, u) { return this.service.publish(id, u); }
    get(id, u) { return this.service.get(id, u); }
    start(id, u) { return this.service.start(id, u); }
    submit(id, d, u) { return this.service.submit(id, d, u); }
    history(u) { return this.service.history(u); }
};
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTestDto, Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "create", null);
__decorate([
    Post(':id/publish'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "publish", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "get", null);
__decorate([
    Post(':id/attempts'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "start", null);
__decorate([
    Post('attempts/:attemptId/submit'),
    __param(0, Param('attemptId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubmitTestDto, Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "submit", null);
__decorate([
    Get('me/attempts'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "history", null);
AssessmentsController = __decorate([
    ApiTags('Assessments'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('tests'),
    __metadata("design:paramtypes", [AssessmentsService])
], AssessmentsController);
export { AssessmentsController };
//# sourceMappingURL=assessments.controller.js.map