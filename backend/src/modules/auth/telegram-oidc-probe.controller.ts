import {
  Controller,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { TelegramOidcProbeService } from './telegram-oidc-probe.service.js';

const APP_CALLBACK_URI = 'hdpacademy://telegram-oidc-probe?complete=1';

@ApiTags('auth-telegram-oidc-probe')
@Controller('auth/telegram/oidc-probe')
export class TelegramOidcProbeController {
  constructor(private readonly probe: TelegramOidcProbeService) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Start a development-only Telegram OIDC verification probe.' })
  start() {
    return this.probe.start();
  }

  @Post('result')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Read the short-lived PASS/FAIL result for a development probe.' })
  result(@Body('probeId') probeId: string | undefined) {
    return { result: this.probe.getResult(probeId) };
  }

  @Get('callback')
  @ApiOperation({ summary: 'Complete the development-only Telegram OIDC verification probe.' })
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    await this.probe.complete(code, state);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.redirect(HttpStatus.FOUND, APP_CALLBACK_URI);
  }
}
