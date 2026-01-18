import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import type { ICurrentUser } from '../../domain/types';

/**
 * LocalClientAuthGuard - Orquestra a LocalClientStrategy
 * Usado no endpoint POST /login para validar credenciais
 */
@Injectable()
export class LocalClientAuthGuard extends AuthGuard('clients') {
  private readonly logger = new Logger(LocalClientAuthGuard.name);

  override handleRequest<TUser extends ICurrentUser = ICurrentUser>(
    err: Error | null,
    user: TUser | false,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    // 1️⃣ Se houver erro, repassa
    if (err) {
      throw err;
    }

    // 2️⃣ Se não houver usuário, erro
    if (!user) {
      this.logger.warn('❌ Tentativa de login sem credenciais válidas');
      throw new Error('Credenciais inválidas');
    }

    // 3️⃣ Sanitiza e retorna usuário
    const sanitized: TUser = {
      id: String(user.id),
      email: String(user.email),
      name: String(user.name || user.email),
    } as TUser;

    this.logger.log(`✅ Guard validado para: ${sanitized.email}`);
    return sanitized;
  }
}
