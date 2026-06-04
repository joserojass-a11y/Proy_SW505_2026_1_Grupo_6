import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { readFileSync } from 'fs';
import * as jwt from 'jsonwebtoken';

type AuthenticatedRequest = Request & {
  user?: {
    sub?: string;
    email?: string;
    role?: 'CLIENT' | 'ADMIN' | 'OWNER';
    iat?: number;
    exp?: number;
  };
};

function loadPublicKey(): string {
  const inlineKey = process.env.JWT_PUBLIC_KEY;
  if (inlineKey) {
    return inlineKey.replace(/\\n/g, '\n');
  }

  const keyPath = process.env.JWT_PUBLIC_KEY_PATH;
  if (keyPath) {
    return readFileSync(keyPath, 'utf8');
  }

  throw new Error('JWT public key is not configured');
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorizationHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const publicKey = loadPublicKey();
      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as AuthenticatedRequest['user'];

      if (!decoded?.sub || !decoded?.email || !decoded?.role) {
        throw new UnauthorizedException('Invalid token payload');
      }

      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
