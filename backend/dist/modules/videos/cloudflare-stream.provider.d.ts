import { ConfigService } from '@nestjs/config';
export interface UploadGrant {
    uid: string;
    uploadUrl: string;
}
export interface PlaybackGrant {
    playbackUrl: string;
    token: string;
    expiresAt: Date;
}
export interface StreamProvider {
    createUpload(maxDurationSeconds: number, title: string): Promise<UploadGrant>;
    createPlayback(uid: string): Promise<PlaybackGrant>;
    deleteVideo(uid: string): Promise<void>;
    verifyWebhook(raw: Buffer, signature: string | undefined): Record<string, unknown>;
}
export declare const STREAM_PROVIDER: unique symbol;
export declare class CloudflareStreamProvider implements StreamProvider {
    private readonly config;
    constructor(config: ConfigService);
    private staging;
    private setting;
    private credentials;
    private request;
    createUpload(maxDurationSeconds: number, title: string): Promise<{
        uid: string;
        uploadUrl: string;
    }>;
    createPlayback(uid: string): Promise<{
        token: string;
        playbackUrl: string;
        expiresAt: Date;
    }>;
    deleteVideo(uid: string): Promise<void>;
    verifyWebhook(raw: Buffer, signature: string | undefined): Record<string, unknown>;
}
