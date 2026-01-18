import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ICurrentUser } from '../../domain/types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

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
