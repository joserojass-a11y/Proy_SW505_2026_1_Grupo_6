import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
}

type RequestWithUser = {
  user?: CurrentUserPayload;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): CurrentUserPayload => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  const user = request.user;

  if (!user || !user.sub) {
    throw new UnauthorizedException('Authenticated user is required');
  }

  return user;
});
