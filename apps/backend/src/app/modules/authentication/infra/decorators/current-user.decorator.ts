import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ICurrentUser } from '../../domain/types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as ICurrentUser;
  },
);
