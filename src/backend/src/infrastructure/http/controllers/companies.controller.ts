import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateTenantCommandHandler } from '../../../application/commands/create-tenant.command-handler';
import { GetTenantQueryHandler } from '../../../application/queries/get-tenant.query-handler';
import { CreateTenantDto } from '../../../application/dtos/create-tenant.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUserId } from '../decorators';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class CompaniesController {
  constructor(
    private readonly createTenantCommandHandler: CreateTenantCommandHandler,
    private readonly getTenantQueryHandler: GetTenantQueryHandler,
  ) {}

  @Post()
  async create(@CurrentUserId() userId: string, @Body() body: CreateTenantDto) {
    return this.createTenantCommandHandler.execute({
      ownerUserId: userId,
      zoneId: body.zoneId,
      countryCode: body.countryCode,
      subdomain: body.subdomain,
      name: body.name,
      globalSettings: body.globalSettings,
    });
  }

  @Get(':id')
  async getById(@Param('id') tenantId: string) {
    return this.getTenantQueryHandler.execute({
      tenantId,
    });
  }
}
