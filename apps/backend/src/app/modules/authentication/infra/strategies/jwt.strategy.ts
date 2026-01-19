import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { ICurrentUser, TokenPayloadUser } from '../../domain/types';

/**
 * JwtStrategy - Valida JWT Bearer token
 * 
 * Extrai token do header Authorization: Bearer <token>
 * Valida assinatura com JWT_SECRET
 * Retorna payload com sub, email, name
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    
    if (!secret) {
      throw new Error('JWT_SECRET não está configurado no .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    this.logger.log('✅ JwtStrategy initialized com JWT_SECRET');
  }

  async validate(payload: TokenPayloadUser): Promise<ICurrentUser> {
    this.logger.debug(`✅ JWT validado para: ${payload.email}`);
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
