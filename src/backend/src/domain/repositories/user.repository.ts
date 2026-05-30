import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';
import { UserStatus } from '../value-objects/user-status.vo';
import { User } from '../entities/user.entity';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email, excludeUserId?: UserId): Promise<boolean>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  updateStatus(id: UserId, status: UserStatus): Promise<void>;
  deleteById(id: UserId): Promise<void>;
}
