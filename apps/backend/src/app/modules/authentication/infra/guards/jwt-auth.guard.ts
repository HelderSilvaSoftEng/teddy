import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard - Guard para JWT Bearer token
 * 
 * Valida token JWT no header Authorization: Bearer <token>
 * Implementado via PassportStrategy(JwtStrategy)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        this.logger.warn('❌ JWT token expirado');
      } else if (info?.name === 'JsonWebTokenError') {
        this.logger.warn(`❌ JWT inválido: ${info.message}`);
      }
      throw err || new Error('Não autorizado');
    }

    this.logger.debug(`✅ JWT válido para usuário: ${user.email}`);
    return user;
  }
}
