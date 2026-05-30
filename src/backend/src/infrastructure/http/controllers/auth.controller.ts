import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginCommandHandler } from '../../../application/commands/login.command-handler';
import { RegisterUserCommandHandler } from '../../../application/commands/register-user.command-handler';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RegisterUserDto } from '../../../application/dtos/register-user.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly registerUserCommandHandler: RegisterUserCommandHandler,
    private readonly loginCommandHandler: LoginCommandHandler,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.registerUserCommandHandler.execute(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.loginCommandHandler.execute(body);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(): Promise<void> {
    return undefined;
  }
}
