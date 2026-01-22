import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import type { ICurrentUser } from '../../domain/types';

@Injectable()
export class LocalUserAuthGuard extends AuthGuard('users') {
  private readonly logger = new Logger(LocalUserAuthGuard.name);

  override handleRequest<TUser extends ICurrentUser = ICurrentUser>(
    err: Error | null,
    user: TUser | false,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err) {
      throw err;
    }

    if (!user) {
      this.logger.warn('❌ Tentativa de login sem credenciais válidas');
      throw new Error('Credenciais inválidas');
    }

    const sanitized: TUser = {
      id: String(user.id),
      email: String(user.email),
      name: String(user.name || user.email),
    } as TUser;

    this.logger.log(`✅ Guard validado para: ${sanitized.email}`);
    return sanitized;
  }
}
