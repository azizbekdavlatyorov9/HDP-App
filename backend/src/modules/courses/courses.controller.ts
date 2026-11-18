import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  CreateCourseDto,
  ListCoursesDto,
  UpdateCourseDto,
} from './courses.dto.js';
import { CoursesService } from './courses.service.js';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}
  @Get() @ApiOperation({ summary: 'List published courses' }) list(
    @Query() query: ListCoursesDto,
  ) {
    return this.service.list(query);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get published course details' })
  details(@Param('id') id: string) {
    return this.service.details(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a course' })
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deactivate a course without deleting dependent records',
  })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user);
  }
  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a course' })
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.setStatus(id, 'published', user);
  }
  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a course' })
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.setStatus(id, 'archived', user);
  }
  @Patch(':id/lead-teacher')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a lead teacher (administrators only)' })
  assignTeacher(
    @Param('id') id: string,
    @Body('teacherId') teacherId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.assignTeacher(id, teacherId, user);
  }
}

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CoursesService) {}
  @Get() @ApiOperation({ summary: 'List active categories' }) list() {
    return this.service.listCategories();
  }
  @Get(':id/courses')
  @ApiOperation({ summary: 'List published courses in a category' })
  courses(@Param('id') id: string, @Query() query: ListCoursesDto) {
    return this.service.categoryCourses(id, query);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category (administrators only)' })
  create(
    @Body() dto: import('./courses.dto.js').CategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createCategory(dto, user);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (administrators only)' })
  update(
    @Param('id') id: string,
    @Body() dto: import('./courses.dto.js').CategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateCategory(id, dto, user);
  }
  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a category (administrators only)' })
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.archiveCategory(id, user);
  }
}
