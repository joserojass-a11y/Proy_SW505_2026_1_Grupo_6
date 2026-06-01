import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenantId = createParamDecorator((_, context: ExecutionContext): string | undefined => {
  const request = context.switchToHttp().getRequest<{ tenant?: { id?: string } }>();
  return request.tenant?.id;
});
