import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import {
  CreateVideoUploadDto,
  LegacyVideoUploadDto,
  VideoListQueryDto,
} from './videos.dto.js';
import { VideosService } from './videos.service.js';

@ApiTags('Videos')
@Controller()
export class VideosController {
  constructor(private readonly service: VideosService) {}

  @Post('videos/upload-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a one-time direct Cloudflare Stream upload URL',
  })
  uploadUrl(
    @Body() dto: CreateVideoUploadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createUpload(
      dto.lessonId,
      dto.maxDurationSeconds,
      user,
      dto.title,
    );
  }

  // Keep the established mobile/admin API route available during client migration.
  @Post('lessons/:lessonId/videos/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  legacyUpload(
    @Param('lessonId') lessonId: string,
    @Body() dto: LegacyVideoUploadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createUpload(lessonId, dto.maxDurationSeconds, user);
  }

  @Get('videos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List video metadata visible to the current user' })
  list(
    @Query() query: VideoListQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.list(user, query.lessonId);
  }

  @Get('videos/:id/playback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Create a short-lived signed HLS playback URL for an enrolled student',
  })
  playback(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.playback(id, user);
  }

  @Get('videos/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'TEACHER')
  @ApiBearerAuth()
  status(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.status(id, user);
  }

  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete the corresponding video from Cloudflare Stream',
  })
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.delete(id, user);
  }
}
