import { UserRepository } from '../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { Email } from '../../domain/value-objects/email.vo';
import { FullName } from '../../domain/value-objects/full-name.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UpdateProfileCommand } from './update-profile.command';

export class UpdateProfileCommandHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<void> {
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    if (command.email) {
      const nextEmail = Email.create(command.email);
      const emailAlreadyInUse = await this.userRepository.existsByEmail(nextEmail, userId);

      if (emailAlreadyInUse) {
        throw new UserAlreadyExistsException(nextEmail.value);
      }
    }

    user.updateProfile({
      email: command.email ? Email.create(command.email) : undefined,
      fullName: command.fullName ? FullName.create(command.fullName) : undefined,
    });

    await this.userRepository.update(user);
  }
}
