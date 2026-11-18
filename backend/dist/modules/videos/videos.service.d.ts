import { Repository } from 'typeorm';
import { Lesson, Video } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import type { StreamProvider } from './cloudflare-stream.provider.js';
export declare class VideosService {
    private readonly videos;
    private readonly lessons;
    private readonly provider;
    private readonly access;
    constructor(videos: Repository<Video>, lessons: Repository<Lesson>, provider: StreamProvider, access: LearningAccessService);
    private admin;
    createUpload(lessonId: string, maxDurationSeconds: number, user: AuthenticatedUser, requestedTitle?: string): Promise<{
        id: string;
        lessonId: string;
        uploadUrl: string;
        status: "pending" | "processing" | "uploading" | "ready" | "error" | "deleted";
        expiresInSeconds: null;
    }>;
    playback(id: string, user: AuthenticatedUser): Promise<import("./cloudflare-stream.provider.js").PlaybackGrant>;
    list(user: AuthenticatedUser, lessonId?: string): Promise<{
        id: string;
        lessonId: string;
        title: string | null;
        position: number;
        status: Video["status"];
        durationSeconds: number | null;
        thumbnailUrl: string | null;
        createdAt: Date;
    }[]>;
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
    webhook(raw: Buffer, signature: string | undefined): Promise<{
        accepted: boolean;
        duplicate: boolean;
    }>;
}
