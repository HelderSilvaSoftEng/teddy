import { Injectable, Logger, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { ICurrentUser } from '../../app/modules/authentication/domain/types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('🔓 Rota pública - autenticação dispensada');
      return true;
    }

    return super.canActivate(context) as boolean;
  }

  override getRequest(context: ExecutionContext): Request {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      request.headers.authorization = `Bearer ${token}`;
      this.logger.debug(`🔑 Authorization header setado com token: ${token.substring(0, 20)}...`);
    } else {
      this.logger.warn(`⚠️ Token inválido ou não encontrado: "${token}"`);
      this.logger.warn(`📍 Current auth header: ${request.headers.authorization}`);
    }

    return request;
  }

  private extractToken(request: Request): string | null {
    const cookieToken = request.cookies?.Authentication as string | undefined;
    if (cookieToken) {
      this.logger.debug('✅ Token extraído do cookie');
      return cookieToken;
    }

    const authHeader = request.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && token !== 'null' && token.length > 0) {
        this.logger.debug('✅ Token extraído do header Authorization');
        return token;
      }
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
