export interface ICredentialVerifier {
  verify(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}
