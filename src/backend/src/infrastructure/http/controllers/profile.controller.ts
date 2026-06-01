import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { GetUserProfileQueryHandler } from '../../../application/queries/get-user-profile.query-handler';
import { UpdateProfileCommandHandler } from '../../../application/commands/update-profile.command-handler';
import { UpdateProfileDto } from '../../../application/dtos/update-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUserId } from '../decorators';

@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENT', 'ADMIN', 'OWNER')
export class ProfileController {
  constructor(
    private readonly getUserProfileQueryHandler: GetUserProfileQueryHandler,
    private readonly updateProfileCommandHandler: UpdateProfileCommandHandler,
  ) {}

  @Get()
  async getProfile(@CurrentUserId() userId: string) {
    return this.getUserProfileQueryHandler.execute({
      userId,
    });
  }

  @Put()
  async updateProfile(@CurrentUserId() userId: string, @Body() body: UpdateProfileDto): Promise<void> {
    await this.updateProfileCommandHandler.execute({
      userId,
      ...(body.email ? { email: body.email } : {}),
      ...(body.fullName ? { fullName: body.fullName } : {}),
    });
  }
}
