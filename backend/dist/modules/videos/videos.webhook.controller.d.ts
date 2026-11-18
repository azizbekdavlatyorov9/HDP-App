import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { VideosService } from './videos.service.js';
export declare class VideosWebhookController {
    private readonly service;
    constructor(service: VideosService);
    webhook(request: RawBodyRequest<Request>, signature?: string): Promise<{
        accepted: boolean;
        duplicate: boolean;
    }>;
}
