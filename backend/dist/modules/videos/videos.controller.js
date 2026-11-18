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
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateVideoUploadDto, LegacyVideoUploadDto, VideoListQueryDto, } from './videos.dto.js';
import { VideosService } from './videos.service.js';
let VideosController = class VideosController {
    service;
    constructor(service) {
        this.service = service;
    }
    uploadUrl(dto, user) {
        return this.service.createUpload(dto.lessonId, dto.maxDurationSeconds, user, dto.title);
    }
    legacyUpload(lessonId, dto, user) {
        return this.service.createUpload(lessonId, dto.maxDurationSeconds, user);
    }
    list(query, user) {
        return this.service.list(user, query.lessonId);
    }
    playback(id, user) {
        return this.service.playback(id, user);
    }
    status(id, user) {
        return this.service.status(id, user);
    }
    delete(id, user) {
        return this.service.delete(id, user);
    }
};
__decorate([
    Post('videos/upload-url'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Create a one-time direct Cloudflare Stream upload URL',
    }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateVideoUploadDto, Object]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "uploadUrl", null);
__decorate([
    Post('lessons/:lessonId/videos/upload'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    __param(0, Param('lessonId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, LegacyVideoUploadDto, Object]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "legacyUpload", null);
__decorate([
    Get('videos'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'List video metadata visible to the current user' }),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VideoListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "list", null);
__decorate([
    Get('videos/:id/playback'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('STUDENT'),
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Create a short-lived signed HLS playback URL for an enrolled student',
    }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "playback", null);
__decorate([
    Get('videos/:id/status'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
    ApiBearerAuth(),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "status", null);
__decorate([
    Delete('videos/:id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'SUPER_ADMIN'),
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Delete the corresponding video from Cloudflare Stream',
    }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "delete", null);
VideosController = __decorate([
    ApiTags('Videos'),
    Controller(),
    __metadata("design:paramtypes", [VideosService])
], VideosController);
export { VideosController };
//# sourceMappingURL=videos.controller.js.map