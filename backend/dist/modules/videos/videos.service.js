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
import { BadRequestException, ForbiddenException, HttpException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson, Video } from '../../database/entities/index.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import { STREAM_PROVIDER } from './cloudflare-stream.provider.js';
const MAX_VIDEO_SECONDS = 36_000;
let VideosService = class VideosService {
    videos;
    lessons;
    provider;
    access;
    constructor(videos, lessons, provider, access) {
        this.videos = videos;
        this.lessons = lessons;
        this.provider = provider;
        this.access = access;
    }
    admin(user) {
        return this.access.isAdmin(user);
    }
    async createUpload(lessonId, maxDurationSeconds, user, requestedTitle) {
        if (!this.admin(user))
            throw new ForbiddenException();
        if (!Number.isInteger(maxDurationSeconds) ||
            maxDurationSeconds < 1 ||
            maxDurationSeconds > MAX_VIDEO_SECONDS) {
            throw new BadRequestException('Invalid maximum video duration');
        }
        const lesson = await this.lessons.findOne({
            where: { id: lessonId },
            relations: { course: true },
        });
        if (!lesson)
            throw new NotFoundException('Lesson not found');
        await this.access.canManageCourse(lesson.course.id, user);
        const title = requestedTitle?.trim() || lesson.title;
        const grant = await this.provider.createUpload(maxDurationSeconds, title);
        const position = (await this.videos.count({ where: { lesson: { id: lessonId } } })) + 1;
        const video = await this.videos.save(this.videos.create({
            lesson,
            initiatedBy: { id: user.id },
            cloudflareUid: grant.uid,
            provider: 'cloudflare_stream',
            title,
            position,
            status: 'pending',
            durationSeconds: null,
            thumbnailUrl: null,
            metadata: null,
        }));
        return {
            id: video.id,
            lessonId,
            uploadUrl: grant.uploadUrl,
            status: video.status,
            expiresInSeconds: null,
        };
    }
    async playback(id, user) {
        const video = await this.videos.findOne({
            where: { id },
            relations: { lesson: true },
        });
        if (!video || video.status === 'deleted')
            throw new NotFoundException('Video not found');
        const lesson = await this.access.canAccessLesson(video.lesson.id, user);
        if (!(await this.access.hasActiveEnrollment(lesson.course.id, user.id))) {
            throw new ForbiddenException('An active course enrollment is required to watch videos');
        }
        if (video.status !== 'ready')
            throw new BadRequestException('Video is not ready');
        return this.provider.createPlayback(video.cloudflareUid);
    }
    async list(user, lessonId) {
        const videos = await this.videos.find({
            where: lessonId ? { lesson: { id: lessonId } } : {},
            relations: { lesson: { course: true } },
            order: { createdAt: 'DESC' },
        });
        const visible = [];
        for (const video of videos) {
            if (video.status === 'deleted')
                continue;
            try {
                if (this.admin(user)) {
                }
                else if (user.roles.includes('TEACHER')) {
                    await this.access.canManageCourse(video.lesson.course.id, user);
                }
                else {
                    const lesson = await this.access.canAccessLesson(video.lesson.id, user);
                    if (!(await this.access.hasActiveEnrollment(lesson.course.id, user.id)))
                        continue;
                    if (video.status !== 'ready')
                        continue;
                }
            }
            catch (error) {
                if (error instanceof HttpException)
                    continue;
                throw error;
            }
            visible.push({
                id: video.id,
                lessonId: video.lesson.id,
                title: video.title,
                position: video.position,
                status: video.status,
                durationSeconds: video.durationSeconds,
                thumbnailUrl: video.thumbnailUrl,
                createdAt: video.createdAt,
            });
        }
        return visible;
    }
    async status(id, user) {
        const video = await this.videos.findOne({
            where: { id },
            relations: { lesson: { course: true } },
        });
        if (!video)
            throw new NotFoundException('Video not found');
        await this.access.canManageCourse(video.lesson.course.id, user);
        return {
            id: video.id,
            status: video.status,
            durationSeconds: video.durationSeconds,
            thumbnailUrl: video.thumbnailUrl,
        };
    }
    async delete(id, user) {
        if (!this.admin(user))
            throw new ForbiddenException();
        const video = await this.videos.findOne({
            where: { id },
            relations: { lesson: { course: true } },
        });
        if (!video)
            throw new NotFoundException('Video not found');
        await this.access.canManageCourse(video.lesson.course.id, user);
        if (video.status === 'deleted')
            return { id: video.id, status: video.status };
        await this.provider.deleteVideo(video.cloudflareUid);
        video.status = 'deleted';
        await this.videos.save(video);
        return { id: video.id, status: video.status };
    }
    async webhook(raw, signature) {
        const event = this.provider.verifyWebhook(raw, signature);
        const uid = event.uid;
        const webhookState = event.status;
        if (typeof uid !== 'string' ||
            !uid ||
            uid.length > 100 ||
            typeof event.readyToStream !== 'boolean' ||
            !webhookState ||
            typeof webhookState !== 'object' ||
            Array.isArray(webhookState)) {
            throw new BadRequestException('Invalid video webhook payload');
        }
        const state = webhookState.state;
        if (!['queued', 'inprogress', 'ready', 'error'].includes(String(state))) {
            throw new BadRequestException('Invalid video webhook status');
        }
        if (event.duration !== undefined &&
            (typeof event.duration !== 'number' ||
                !Number.isFinite(event.duration) ||
                event.duration < 0)) {
            throw new BadRequestException('Invalid video webhook duration');
        }
        const video = await this.videos.findOne({ where: { cloudflareUid: uid } });
        if (!video)
            throw new NotFoundException('Video not found');
        if (video.status === 'deleted' ||
            video.status === 'ready' ||
            video.status === 'error') {
            return { accepted: true, duplicate: true };
        }
        const nextStatus = state === 'ready' && event.readyToStream
            ? 'ready'
            : state === 'error'
                ? 'error'
                : 'processing';
        const nextDuration = typeof event.duration === 'number'
            ? Math.floor(event.duration)
            : video.durationSeconds;
        const thumbnail = event.thumbnail;
        const nextThumbnail = typeof thumbnail === 'string' && thumbnail.startsWith('https://')
            ? thumbnail
            : video.thumbnailUrl;
        if (video.status === nextStatus &&
            video.durationSeconds === nextDuration &&
            video.thumbnailUrl === nextThumbnail)
            return { accepted: true, duplicate: true };
        video.status = nextStatus;
        video.durationSeconds = nextDuration;
        video.thumbnailUrl = nextThumbnail;
        await this.videos.save(video);
        return { accepted: true, duplicate: false };
    }
};
VideosService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Video)),
    __param(1, InjectRepository(Lesson)),
    __param(2, Inject(STREAM_PROVIDER)),
    __metadata("design:paramtypes", [Repository,
        Repository, Object, LearningAccessService])
], VideosService);
export { VideosService };
//# sourceMappingURL=videos.service.js.map