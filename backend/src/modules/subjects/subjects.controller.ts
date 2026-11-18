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
import { CreateSubjectDto, UpdateSubjectDto } from './subjects.dto.js';
import { SubjectsService } from './subjects.service.js';

@ApiTags('Subjects')
@Controller('courses/:courseId/subjects')
export class CourseSubjectsController {
  constructor(private readonly subjects: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List active subjects of a published course' })
  list(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.subjects.listForCourse(courseId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a subject for a course' })
  create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateSubjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.subjects.create(courseId, dto, user);
  }
}

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjects: SubjectsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get an active subject' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjects.get(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subject' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.subjects.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a subject without deleting its record' })
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.subjects.archive(id, user);
  }
}
