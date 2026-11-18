import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson, Video } from '../../database/entities/index.js';
import { LearningModule } from '../learning/learning.module.js';
import { VideosController } from './videos.controller.js';
import { VideosWebhookController } from './videos.webhook.controller.js';
import { VideosService } from './videos.service.js';
import {
  CloudflareStreamProvider,
  STREAM_PROVIDER,
} from './cloudflare-stream.provider.js';
@Module({
  imports: [TypeOrmModule.forFeature([Video, Lesson]), LearningModule],
  controllers: [VideosController, VideosWebhookController],
  providers: [
    VideosService,
    CloudflareStreamProvider,
    { provide: STREAM_PROVIDER, useExisting: CloudflareStreamProvider },
  ],
})
export class VideosModule {}
