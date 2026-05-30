export interface IJwtTokenGenerator {
  generateToken(payload: Record<string, unknown>): Promise<string>;
}
