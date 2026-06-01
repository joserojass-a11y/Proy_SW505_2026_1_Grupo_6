import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { CreateCustomerCommandHandler } from '../../../application/commands/create-customer.command-handler';
import { UpdateCustomerCommandHandler } from '../../../application/commands/update-customer.command-handler';
import { GetCustomerProfileQueryHandler } from '../../../application/queries/get-customer-profile.query-handler';
import { CreateCustomerDto } from '../../../application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../../application/dtos/update-customer.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUserId } from '../decorators';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENT', 'ADMIN', 'OWNER')
export class CustomersController {
  constructor(
    private readonly createCustomerCommandHandler: CreateCustomerCommandHandler,
    private readonly updateCustomerCommandHandler: UpdateCustomerCommandHandler,
    private readonly getCustomerProfileQueryHandler: GetCustomerProfileQueryHandler,
  ) {}

  @Post()
  async create(@CurrentUserId() userId: string, @Body() body: CreateCustomerDto) {
    return this.createCustomerCommandHandler.execute({
      userId,
      tenantId: body.tenantId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      timezone: body.timezone,
      preferences: body.preferences,
      consentSigned: body.consentSigned,
    });
  }

  @Get('me')
  async getMe(@CurrentUserId() userId: string) {
    return this.getCustomerProfileQueryHandler.execute({
      userId,
    });
  }

  @Put('me')
  async updateMe(@CurrentUserId() userId: string, @Body() body: UpdateCustomerDto) {
    return this.updateCustomerCommandHandler.execute({
      userId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      timezone: body.timezone,
      preferences: body.preferences,
      consentSigned: body.consentSigned,
    });
  }
}
