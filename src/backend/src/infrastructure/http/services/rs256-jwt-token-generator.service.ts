import { readFileSync } from 'fs';
import { IJwtTokenGenerator } from '../../../application/services/jwt-token-generator.interface';
import * as jwt from 'jsonwebtoken';

function loadPrivateKey(): string {
  const inlineKey = process.env.JWT_PRIVATE_KEY;
  if (inlineKey) {
    return inlineKey.replace(/\\n/g, '\n');
  }

  const keyPath = process.env.JWT_PRIVATE_KEY_PATH;
  if (keyPath) {
    return readFileSync(keyPath, 'utf8');
  }

  throw new Error('JWT private key is not configured');
}

export class Rs256JwtTokenGeneratorService implements IJwtTokenGenerator {
  async generateToken(payload: Record<string, unknown>): Promise<string> {
    const privateKey: jwt.Secret = loadPrivateKey();
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '1h';
    const issuer = process.env.JWT_ISSUER;
    const audience = process.env.JWT_AUDIENCE;

    const signOptions: jwt.SignOptions = {
      algorithm: 'RS256',
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    };

    if (issuer) {
      signOptions.issuer = issuer;
    }
    if (audience) {
      signOptions.audience = audience;
    }

    return jwt.sign(payload, privateKey, signOptions);
  }
}
