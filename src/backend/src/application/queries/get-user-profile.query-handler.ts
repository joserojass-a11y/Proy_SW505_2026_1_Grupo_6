import { UserRepository } from '../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { GetUserProfileQuery } from './get-user-profile.query';
import { UserProfileDto } from '../dtos/user-profile.dto';

export class GetUserProfileQueryHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserProfileQuery): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(UserId.create(query.userId));

    if (!user) {
      throw new UserNotFoundException(query.userId);
    }

    return {
      id: user.id.value,
      email: user.email.value,
      fullName: user.fullName.value,
      role: user.role.value,
      status: user.status.value,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
