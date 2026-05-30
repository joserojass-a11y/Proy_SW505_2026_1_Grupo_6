import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../../application/services/password-hasher.interface';

export class BcryptPasswordHasherService implements IPasswordHasher {
  constructor(private readonly saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12)) {}

  async hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, this.saltRounds);
  }

  async compare(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
