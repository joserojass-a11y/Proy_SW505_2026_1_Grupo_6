export interface IPasswordHasher {
  hash(plainTextPassword: string): Promise<string>;
  compare(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}
