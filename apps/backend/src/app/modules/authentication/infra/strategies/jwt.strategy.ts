import { Injectable } from '@nestjs/common';
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
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayloadUser): Promise<ICurrentUser> {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
