import { UserRepository } from '../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { Email } from '../../domain/value-objects/email.vo';
import { LoginCommand } from './login.command';
import { IPasswordHasher } from '../services/password-hasher.interface';
import { IJwtTokenGenerator } from '../services/jwt-token-generator.interface';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

export class LoginCommandHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtTokenGenerator: IJwtTokenGenerator,
  ) { }

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException(email.value);
    }

    const isPasswordValid = await this.passwordHasher.compare(command.password, user.passwordHash.value);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    if (!user.status.isActive()) {
      throw new InvalidCredentialsException();
    }

    const accessToken = await this.jwtTokenGenerator.generateToken({
      sub: user.id.value,
      email: user.email.value,
      role: user.role.value,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }
}
