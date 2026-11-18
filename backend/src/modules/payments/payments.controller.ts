import { Body,Controller,Get,Headers,Param,Post,Query,UseGuards } from '@nestjs/common';import { ApiBearerAuth,ApiOperation,ApiTags } from '@nestjs/swagger';import { CurrentUser } from '../../common/decorators/current-user.decorator.js';import { Roles } from '../../common/decorators/roles.decorator.js';import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';import { AdminPaymentQueryDto,ClickCallbackDto,CreatePaymentDto,PaymeRpcDto,RefundDto } from './payments.dto.js';import { PaymentsService } from './payments.service.js';import { PaymeProvider } from './payme.provider.js';import { ClickCallbackService } from './click-callback.service.js';
@ApiTags('Payments') @Controller('payments') export class PaymentsController{
 constructor(private readonly service:PaymentsService,private readonly payme:PaymeProvider,private readonly click:ClickCallbackService){}
 @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth() @ApiOperation({summary:'Create a course payment and receive provider checkout information'}) create(@Body() dto:CreatePaymentDto,@CurrentUser() u:AuthenticatedUser){return this.service.create(dto,u);}
 @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth() @ApiOperation({summary:'List the current user payment history'}) mine(@CurrentUser() u:AuthenticatedUser,@Query('page') page?:string,@Query('limit') limit?:string){return this.service.mine(u,Math.max(1,Number(page)||1),Math.min(100,Math.max(1,Number(limit)||20)));}
 @Get(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth() @ApiOperation({summary:'View one of the current user payments'}) detail(@Param('id') id:string,@CurrentUser() u:AuthenticatedUser){return this.service.ownDetail(id,u);}
 @Post('callbacks/payme') @ApiOperation({summary:'Payme Merchant API JSON-RPC callback'}) paymeCallback(@Headers('authorization') auth:string|undefined,@Body() request:PaymeRpcDto){if(!this.payme.verifyAuthorization(auth))return {jsonrpc:'2.0',id:request.id??null,error:{code:-32504,message:'Insufficient privileges'}};return this.service.paymeRpc(request);}
 @Post('callbacks/click/prepare') @ApiOperation({summary:'Click Shop API Prepare callback'}) clickPrepare(@Body() p:ClickCallbackDto){return this.click.prepare(p);}
 @Post('callbacks/click/complete') @ApiOperation({summary:'Click Shop API Complete callback'}) clickComplete(@Body() p:ClickCallbackDto){return this.click.complete(p);}
}

@ApiTags('Admin payments') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles('ADMIN','SUPER_ADMIN') @Controller('admin/payments') export class AdminPaymentsController{
 constructor(private readonly service:PaymentsService){}
 @Get() @ApiOperation({summary:'Filter and paginate payments (administrators only)'}) list(@Query() q:AdminPaymentQueryDto){return this.service.adminList(q);}
 @Get('statistics') @ApiOperation({summary:'Payment totals grouped by status (administrators only)'}) statistics(){return this.service.statistics();}
 @Get(':id') @ApiOperation({summary:'View payment and provider transaction history (administrators only)'}) detail(@Param('id') id:string){return this.service.adminDetail(id);}
 @Post(':id/refund') @ApiOperation({summary:'Initiate a provider supported refund (administrators only)'}) refund(@Param('id') id:string,@Body() d:RefundDto,@CurrentUser() u:AuthenticatedUser){return this.service.refund(id,u,d.reason);}
}
