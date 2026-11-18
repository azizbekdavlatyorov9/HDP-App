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
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ChangeLeadStatusDto, ConvertLeadDto, CreateActivityDto, CreateLeadDto, LeadListDto, TrialCreateDto, TrialStatusDto, TrialUpdateDto, UpdateLeadDto } from './crm.dto.js';
import { CrmService } from './crm.service.js';
let CrmAdminController = class CrmAdminController {
    crm;
    constructor(crm) {
        this.crm = crm;
    }
    create(dto, u) { return this.crm.create(dto, u); }
    list(q, u) { return this.crm.list(q, u); }
    get(id, u) { return this.crm.get(id, u); }
    update(id, dto, u) { return this.crm.update(id, dto, u); }
    status(id, dto, u) { return this.crm.changeStatus(id, dto, u); }
    activities(id, page = '1', limit = '20', u) { return this.crm.activities(id, Math.max(1, Number(page) || 1), Math.min(100, Math.max(1, Number(limit) || 20)), u); }
    activity(id, dto, u) { return this.crm.addActivity(id, dto, u); }
    createTrial(id, dto, u) { return this.crm.createTrial(id, dto, u); }
    trials(id, u) { return this.crm.trials(id, u); }
    updateTrial(id, dto, u) { return this.crm.updateTrial(id, dto, u); }
    trialStatus(id, dto, u) { return this.crm.setTrialStatus(id, dto, u); }
    convert(id, dto, u) { return this.crm.convert(id, dto, u); }
    overdue(u) { return this.crm.followUps(u, true); }
    upcoming(u) { return this.crm.followUps(u, false); }
    statistics(u) { return this.crm.statistics(u); }
    workload(u) { return this.crm.operatorWorkload(u); }
};
__decorate([
    Post('leads'),
    ApiOperation({ summary: 'Create a lead' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "create", null);
__decorate([
    Get('leads'),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LeadListDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "list", null);
__decorate([
    Get('leads/:id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "get", null);
__decorate([
    Patch('leads/:id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "update", null);
__decorate([
    Post('leads/:id/status'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ChangeLeadStatusDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "status", null);
__decorate([
    Get('leads/:id/activities'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Query('page')),
    __param(2, Query('limit')),
    __param(3, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "activities", null);
__decorate([
    Post('leads/:id/activities'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateActivityDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "activity", null);
__decorate([
    Post('leads/:id/trials'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, TrialCreateDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "createTrial", null);
__decorate([
    Get('leads/:id/trials'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "trials", null);
__decorate([
    Patch('trials/:id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, TrialUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "updateTrial", null);
__decorate([
    Post('trials/:id/status'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, TrialStatusDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "trialStatus", null);
__decorate([
    Post('leads/:id/convert'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ConvertLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "convert", null);
__decorate([
    Get('follow-ups/overdue'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "overdue", null);
__decorate([
    Get('follow-ups/upcoming'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "upcoming", null);
__decorate([
    Get('statistics'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "statistics", null);
__decorate([
    Get('operators/workload'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmAdminController.prototype, "workload", null);
CrmAdminController = __decorate([
    ApiTags('CRM'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
    Controller('admin/crm'),
    __metadata("design:paramtypes", [CrmService])
], CrmAdminController);
export { CrmAdminController };
let CrmOperatorController = class CrmOperatorController {
    crm;
    constructor(crm) {
        this.crm = crm;
    }
    list(q, u) { return this.crm.list(q, u); }
    overdue(u) { return this.crm.followUps(u, true); }
    upcoming(u) { return this.crm.followUps(u, false); }
    get(id, u) { return this.crm.get(id, u); }
    update(id, dto, u) { return this.crm.update(id, dto, u); }
    status(id, dto, u) { return this.crm.changeStatus(id, dto, u); }
    activities(id, u) { return this.crm.activities(id, 1, 50, u); }
    activity(id, dto, u) { return this.crm.addActivity(id, dto, u); }
    createTrial(id, dto, u) { return this.crm.createTrial(id, dto, u); }
    trials(id, u) { return this.crm.trials(id, u); }
    convert(id, dto, u) { return this.crm.convert(id, dto, u); }
    statistics(u) { return this.crm.statistics(u); }
};
__decorate([
    Get(),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LeadListDto, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "list", null);
__decorate([
    Get('follow-ups/overdue'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "overdue", null);
__decorate([
    Get('follow-ups/upcoming'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "upcoming", null);
__decorate([
    Get(':id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "get", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "update", null);
__decorate([
    Post(':id/status'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ChangeLeadStatusDto, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "status", null);
__decorate([
    Get(':id/activities'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "activities", null);
__decorate([
    Post(':id/activities'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateActivityDto, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "activity", null);
__decorate([
    Post(':id/trials'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, TrialCreateDto, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "createTrial", null);
__decorate([
    Get(':id/trials'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "trials", null);
__decorate([
    Post(':id/convert'),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ConvertLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "convert", null);
__decorate([
    Get('statistics/summary'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmOperatorController.prototype, "statistics", null);
CrmOperatorController = __decorate([
    ApiTags('CRM operator'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Roles('TEACHER'),
    Controller('crm/me/leads'),
    __metadata("design:paramtypes", [CrmService])
], CrmOperatorController);
export { CrmOperatorController };
//# sourceMappingURL=crm.controller.js.map