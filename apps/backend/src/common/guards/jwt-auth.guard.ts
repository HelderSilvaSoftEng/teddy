import { Injectable, Logger, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { ICurrentUser } from '../../app/modules/authentication/domain/types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  override getRequest(context: ExecutionContext): Request {
    const request = context.switchToHttp().getRequest<Request>();

    // Extrair token de cookie ou Authorization header
    const token = this.extractToken(request);

    if (token) {
      // Se encontrou token em cookie ou header, adiciona ao Authorization header
      // para que a estratégia JWT do Passport possa processar
      request.headers.authorization = `Bearer ${token}`;
    }

    return request;
  }

  /**
   * Extrai token do cookie ou Authorization header
   * Prioridade: Cookie > Authorization Header
   */
  private extractToken(request: Request): string | null {
    // Prioridade 1: Cookie (mais seguro contra XSS)
    const cookieToken = request.cookies?.Authentication as string | undefined;
    if (cookieToken) {
      this.logger.debug('✅ Token extraído do cookie');
      return cookieToken;
    }

    // Prioridade 2: Authorization Header (para APIs externas)
    const authHeader = request.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      this.logger.debug('✅ Token extraído do header Authorization');
      return authHeader.substring(7);
    }

    this.logger.warn('⚠️ Token não encontrado em cookie ou Authorization header');
    return null;
  }

  override handleRequest<TUser extends ICurrentUser = ICurrentUser>(
    err: Error | null,
    user: TUser | false,
    info: { name?: string; message?: string } | undefined,
    context: unknown,
    status?: number,
  ): TUser {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        this.logger.warn('❌ JWT token expirado');
        throw new UnauthorizedException('Token expirado');
      } else if (info?.name === 'JsonWebTokenError') {
        this.logger.warn(`❌ JWT inválido: ${info?.message || 'desconhecido'}`);
        throw new UnauthorizedException('Token inválido');
      }
      throw err || new UnauthorizedException('Não autorizado');
    }

    this.logger.debug(`✅ JWT válido para usuário: ${user.email}`);
    return user as TUser;
  }
}
