import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { EnrollmentStatusDto, ManualEnrollmentDto } from './enrollments.dto.js';
import { EnrollmentsService } from './enrollments.service.js';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}
  @Get('my') mine(@CurrentUser() user: AuthenticatedUser) {
    return this.service.mine(user);
  }
  @Get(':id') detail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.detail(id, user);
  }
}

@ApiTags('Admin enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/enrollments')
export class AdminEnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}
  @Post() manual(
    @Body() dto: ManualEnrollmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.manual(dto, user);
  }
  @Get() list(@CurrentUser() user: AuthenticatedUser) {
    return this.service.adminList(user);
  }
  @Get(':id') detail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.detail(id, user);
  }
  @Patch(':id/status') status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnrollmentStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.setStatus(id, dto.status, user);
  }
}
