import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

type RequestWithUser = {
  user?: {
    sub?: string;
  };
};

export const CurrentUserId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  const userId = request.user?.sub;

  if (!userId) {
    throw new UnauthorizedException('Authenticated user id is required');
  }

  return userId;
});