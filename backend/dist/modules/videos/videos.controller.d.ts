import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { CreateVideoUploadDto, LegacyVideoUploadDto, VideoListQueryDto } from './videos.dto.js';
import { VideosService } from './videos.service.js';
export declare class VideosController {
    private readonly service;
    constructor(service: VideosService);
    uploadUrl(dto: CreateVideoUploadDto, user: AuthenticatedUser): Promise<{
        id: string;
        lessonId: string;
        uploadUrl: string;
        status: "pending" | "processing" | "uploading" | "ready" | "error" | "deleted";
        expiresInSeconds: null;
    }>;
    legacyUpload(lessonId: string, dto: LegacyVideoUploadDto, user: AuthenticatedUser): Promise<{
        id: string;
        lessonId: string;
        uploadUrl: string;
        status: "pending" | "processing" | "uploading" | "ready" | "error" | "deleted";
        expiresInSeconds: null;
    }>;
    list(query: VideoListQueryDto, user: AuthenticatedUser): Promise<{
        id: string;
        lessonId: string;
        title: string | null;
        position: number;
        status: import("../../database/entities/education.entity.js").Video["status"];
        durationSeconds: number | null;
        thumbnailUrl: string | null;
        createdAt: Date;
    }[]>;
    playback(id: string, user: AuthenticatedUser): Promise<import("./cloudflare-stream.provider.js").PlaybackGrant>;
    status(id: string, user: AuthenticatedUser): Promise<{
        id: string;
        status: "pending" | "processing" | "uploading" | "ready" | "error" | "deleted";
        durationSeconds: number | null;
        thumbnailUrl: string | null;
    }>;
    delete(id: string, user: AuthenticatedUser): Promise<{
        id: string;
        status: "deleted";
    }>;
}
