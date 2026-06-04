import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginCommandHandler } from '../../../application/commands/login.command-handler';
import { RegisterUserCommandHandler } from '../../../application/commands/register-user.command-handler';
import { RegisterOwnerCommandHandler } from '../../../application/commands/register-owner.command-handler';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RegisterUserDto } from '../../../application/dtos/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserCommandHandler: RegisterUserCommandHandler,
    private readonly registerOwnerCommandHandler: RegisterOwnerCommandHandler,
    private readonly loginCommandHandler: LoginCommandHandler,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.registerUserCommandHandler.execute({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
    });
  }

  @Post('register-owner')
  async registerOwner(@Body() body: RegisterUserDto) {
    return this.registerOwnerCommandHandler.execute({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
    });
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.loginCommandHandler.execute({
      email: body.email,
      password: body.password,
    });
  }

  @Post('logout')
  @HttpCode(204)
  async logout(): Promise<void> {
    return undefined;
  }
}
