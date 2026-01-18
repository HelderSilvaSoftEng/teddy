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

  handleRequest<TUser = any>(
    err: unknown,
    user: any,
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
      throw err;
    }

    // 3️⃣ Sanitiza e retorna usuário
    const sanitized: ICurrentUser = {
      id: String(user.id),
      email: String(user.email),
      name: String(user.name || user.email),
    };

    this.logger.log(`✅ Guard validado para: ${sanitized.email}`);
    return sanitized as unknown as TUser;
  }
}
