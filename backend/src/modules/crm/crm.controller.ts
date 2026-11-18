import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ChangeLeadStatusDto, ConvertLeadDto, CreateActivityDto, CreateLeadDto, LeadListDto, TrialCreateDto, TrialStatusDto, TrialUpdateDto, UpdateLeadDto } from './crm.dto.js';
import { CrmService } from './crm.service.js';

@ApiTags('CRM') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('ADMIN','SUPER_ADMIN','TEACHER')
@Controller('admin/crm')
export class CrmAdminController {
 constructor(private readonly crm:CrmService){}
 @Post('leads') @ApiOperation({summary:'Create a lead'}) create(@Body() dto:CreateLeadDto,@CurrentUser() u:AuthenticatedUser){return this.crm.create(dto,u);}
 @Get('leads') list(@Query() q:LeadListDto,@CurrentUser() u:AuthenticatedUser){return this.crm.list(q,u);}
 @Get('leads/:id') get(@Param('id',ParseUUIDPipe) id:string,@CurrentUser() u:AuthenticatedUser){return this.crm.get(id,u);}
 @Patch('leads/:id') update(@Param('id',ParseUUIDPipe) id:string,@Body() dto:UpdateLeadDto,@CurrentUser() u:AuthenticatedUser){return this.crm.update(id,dto,u);}
 @Post('leads/:id/status') status(@Param('id',ParseUUIDPipe) id:string,@Body() dto:ChangeLeadStatusDto,@CurrentUser() u:AuthenticatedUser){return this.crm.changeStatus(id,dto,u);}
 @Get('leads/:id/activities') activities(@Param('id',ParseUUIDPipe) id:string,@Query('page') page='1',@Query('limit') limit='20',@CurrentUser() u:AuthenticatedUser){return this.crm.activities(id,Math.max(1,Number(page)||1),Math.min(100,Math.max(1,Number(limit)||20)),u);}
 @Post('leads/:id/activities') activity(@Param('id',ParseUUIDPipe) id:string,@Body() dto:CreateActivityDto,@CurrentUser() u:AuthenticatedUser){return this.crm.addActivity(id,dto,u);}
 @Post('leads/:id/trials') createTrial(@Param('id',ParseUUIDPipe) id:string,@Body() dto:TrialCreateDto,@CurrentUser() u:AuthenticatedUser){return this.crm.createTrial(id,dto,u);}
 @Get('leads/:id/trials') trials(@Param('id',ParseUUIDPipe) id:string,@CurrentUser() u:AuthenticatedUser){return this.crm.trials(id,u);}
 @Patch('trials/:id') updateTrial(@Param('id',ParseUUIDPipe) id:string,@Body() dto:TrialUpdateDto,@CurrentUser() u:AuthenticatedUser){return this.crm.updateTrial(id,dto,u);}
 @Post('trials/:id/status') trialStatus(@Param('id',ParseUUIDPipe) id:string,@Body() dto:TrialStatusDto,@CurrentUser() u:AuthenticatedUser){return this.crm.setTrialStatus(id,dto,u);}
 @Post('leads/:id/convert') convert(@Param('id',ParseUUIDPipe) id:string,@Body() dto:ConvertLeadDto,@CurrentUser() u:AuthenticatedUser){return this.crm.convert(id,dto,u);}
 @Get('follow-ups/overdue') overdue(@CurrentUser() u:AuthenticatedUser){return this.crm.followUps(u,true);}
 @Get('follow-ups/upcoming') upcoming(@CurrentUser() u:AuthenticatedUser){return this.crm.followUps(u,false);}
 @Get('statistics') statistics(@CurrentUser() u:AuthenticatedUser){return this.crm.statistics(u);}
 @Get('operators/workload') workload(@CurrentUser() u:AuthenticatedUser){return this.crm.operatorWorkload(u);}
}
@ApiTags('CRM operator') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('TEACHER') @Controller('crm/me/leads')
export class CrmOperatorController {
 constructor(private readonly crm:CrmService){}
 @Get() list(@Query() q:LeadListDto,@CurrentUser() u:AuthenticatedUser){return this.crm.list(q,u);}
 @Get('follow-ups/overdue') overdue(@CurrentUser() u:AuthenticatedUser){return this.crm.followUps(u,true);}
 @Get('follow-ups/upcoming') upcoming(@CurrentUser() u:AuthenticatedUser){return this.crm.followUps(u,false);}
 @Get(':id') get(@Param('id',ParseUUIDPipe) id:string,@CurrentUser() u:AuthenticatedUser){return this.crm.get(id,u);}
 @Patch(':id') update(@Param('id',ParseUUIDPipe) id:string,@Body() dto:UpdateLeadDto,@CurrentUser() u:AuthenticatedUser){return this.crm.update(id,dto,u);}
 @Post(':id/status') status(@Param('id',ParseUUIDPipe) id:string,@Body() dto:ChangeLeadStatusDto,@CurrentUser() u:AuthenticatedUser){return this.crm.changeStatus(id,dto,u);}
 @Get(':id/activities') activities(@Param('id',ParseUUIDPipe) id:string,@CurrentUser() u:AuthenticatedUser){return this.crm.activities(id,1,50,u);}
 @Post(':id/activities') activity(@Param('id',ParseUUIDPipe) id:string,@Body() dto:CreateActivityDto,@CurrentUser() u:AuthenticatedUser){return this.crm.addActivity(id,dto,u);}
 @Post(':id/trials') createTrial(@Param('id',ParseUUIDPipe) id:string,@Body() dto:TrialCreateDto,@CurrentUser() u:AuthenticatedUser){return this.crm.createTrial(id,dto,u);}
 @Get(':id/trials') trials(@Param('id',ParseUUIDPipe) id:string,@CurrentUser() u:AuthenticatedUser){return this.crm.trials(id,u);}
 @Post(':id/convert') convert(@Param('id',ParseUUIDPipe) id:string,@Body() dto:ConvertLeadDto,@CurrentUser() u:AuthenticatedUser){return this.crm.convert(id,dto,u);}
 @Get('statistics/summary') statistics(@CurrentUser() u:AuthenticatedUser){return this.crm.statistics(u);}
}
