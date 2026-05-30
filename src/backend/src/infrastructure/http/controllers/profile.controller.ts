import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GetUserProfileQueryHandler } from '../../../application/queries/get-user-profile.query-handler';
import { UpdateProfileCommandHandler } from '../../../application/commands/update-profile.command-handler';
import { UpdateProfileDto } from '../../../application/dtos/update-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

type AuthenticatedRequest = Request & {
  user?: {
    sub?: string;
    email?: string;
    role?: 'CLIENT' | 'ADMIN';
  };
};

@Controller('api/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENT', 'ADMIN')
export class ProfileController {
  constructor(
    private readonly getUserProfileQueryHandler: GetUserProfileQueryHandler,
    private readonly updateProfileCommandHandler: UpdateProfileCommandHandler,
  ) {}

  @Get()
  async getProfile(@Req() request: AuthenticatedRequest) {
    return this.getUserProfileQueryHandler.execute({
      userId: request.user?.sub ?? '',
    });
  }

  @Put()
  async updateProfile(@Req() request: AuthenticatedRequest, @Body() body: UpdateProfileDto): Promise<void> {
    await this.updateProfileCommandHandler.execute({
      userId: request.user?.sub ?? '',
      ...body,
    });
  }
}
