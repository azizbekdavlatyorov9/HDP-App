import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import {
  CreateLessonDto,
  CreateSubjectLessonDto,
  ReorderLessonsDto,
  UpdateLessonDto,
} from './lessons.dto.js';
import { LessonsService } from './lessons.service.js';

@ApiTags('Lessons')
@Controller()
export class LessonsController {
  constructor(private readonly service: LessonsService) {}

  @Post('courses/:courseId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a draft lesson in a managed course' })
  create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(courseId, dto, user);
  }

  @Get('courses/:courseId/lessons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List published lessons with learner lock state' })
  list(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.list(courseId, user);
  }

  @Post('courses/:courseId/lessons/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  reorder(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: ReorderLessonsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.reorder(courseId, dto.lessonIds, user);
  }

  @Get('subjects/:subjectId/lessons')
  @ApiOperation({
    summary: 'Public list of published lessons for an active subject',
  })
  listForSubject(@Param('subjectId', ParseUUIDPipe) subjectId: string) {
    return this.service.publicListForSubject(subjectId);
  }

  @Post('subjects/:subjectId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  createForSubject(
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Body() dto: CreateSubjectLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createForSubject(subjectId, dto, user);
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Public details for a published lesson' })
  publicDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.publicDetail(id);
  }

  // Retains the prior enrollment-checked lesson detail operation.
  @Get('lessons/:id/access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  detail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.detail(id, user);
  }

  @Patch('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Post('lessons/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.publish(id, user);
  }

  @Delete('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.archive(id, user);
  }

  @Post('lessons/:id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  archiveLegacy(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.archive(id, user);
  }
}
