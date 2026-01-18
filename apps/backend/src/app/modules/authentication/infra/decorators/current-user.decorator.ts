import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ICurrentUser } from '../../domain/types';

/**
 * @CurrentUser() - Decorator para injetar usuário atual
 * 
 * Extrai usuário do request.user (setado pelo guard)
 * Tipo: ICurrentUser { id, email, name }
 * 
 * Uso:
 * async logout(@CurrentUser() user: ICurrentUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as ICurrentUser;
  },
);
