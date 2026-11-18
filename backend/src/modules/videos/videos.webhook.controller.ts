import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { VideosService } from './videos.service.js';

@Controller('videos')
export class VideosWebhookController {
  constructor(private readonly service: VideosService) {}

  @Post('webhook')
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('webhook-signature') signature?: string,
  ) {
    return this.service.webhook(request.rawBody ?? Buffer.alloc(0), signature);
  }
}
