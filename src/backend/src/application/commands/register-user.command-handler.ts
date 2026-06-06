import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { FullName } from '../../domain/value-objects/full-name.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { RegisterUserCommand } from './register-user.command';
import { IPasswordHasher } from '../services/password-hasher.interface';
import { RegisterUserResponseDto } from '../dtos/register-user-response.dto';

export class RegisterUserCommandHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) { }

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponseDto> {
    const email = Email.create(command.email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(email.value);
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = User.create({
      id: UserId.create(randomUUID()),
      email,
      passwordHash: PasswordHash.create(passwordHash),
      fullName: FullName.create(command.fullName),
      status: 'ACTIVE'
    });

    const savedUser = await this.userRepository.save(user);

    return { id: savedUser.id.value };
  }
}
