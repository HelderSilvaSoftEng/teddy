import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { randomUUID } from 'crypto';
import type { ICurrentUser, TokenPayloadUser, LoginResponse } from '../../domain/types';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import { User } from "../../../users/domain/entities/user.entity";

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
  ) {}

  async execute(user: ICurrentUser, response: Response): Promise<LoginResponse> {
    try {
      this.logger.log(`🔐 Iniciando login para: ${user.email}`);

      // 1️⃣ Buscar cliente no BD para ter dados atualizados
      const user = await this.userRepository.findById(user.id);
      if (!client) {
        throw new Error('Cliente não encontrado');
      }

      // 2️⃣ Preparar payload do Access Token (curta duração - 15 min)
      const accessTokenPayload: TokenPayloadUser = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };

      // 3️⃣ Gerar Access Token
      const accessTokenTtl = this.configService.get<number>('JWT_EXPIRATION') ?? 3600; // 1 hora default
      const accessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: `${accessTokenTtl}s`, // ✅ Converter para string com 's' (segundos)
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.log(`✅ Access Token gerado com TTL ${accessTokenTtl}s: ${user.email}`);

      // 4️⃣ Gerar Refresh Token (7 dias) com JTI único
      const jti = randomUUID();
      const refreshTokenTtl = this.configService.get('REFRESH_TOKEN_TTL', 604800); // 7 dias

      const refreshTokenPayload = {
        sub: user.id,
        jti,
        typ: 'refresh',
      };

      const refreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: `${refreshTokenTtl}s`, // ✅ Converter para string com 's' (segundos)
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') ?? this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.log(`✅ Refresh Token gerado com TTL ${refreshTokenTtl}s: ${user.email}`);

      // 5️⃣ Hash do JTI usando o método estático da entity
      const hashedJti = user.hashPassword(jti);

      // 6️⃣ Incrementar contador de acessos (login count)
      user.incrementAccessCount();

      // 7️⃣ Salvar refresh token hash no cliente
      user.refreshTokenHash = hashedJti;
      user.refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);

      await this.userRepository.update(user.id, client);

      // 8️⃣ Incrementar contador de acessos no repositório (SQL)
      await this.userRepository.incrementAccessCount(user.id);

      this.logger.log(`✅ Refresh token hash e contador de acessos atualizados no BD: ${user.email}`);

      // 7️⃣ Setar cookies httpOnly com tokens
      const accessTokenExpires = new Date();
      accessTokenExpires.setSeconds(accessTokenExpires.getSeconds() + (this.configService.get<number>('JWT_EXPIRATION') ?? 900));

      const refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);
      const isProduction = this.configService.get('NODE_ENV') === 'production';

      this.logger.log(`🍪 Setando cookie Authentication com expiração: ${accessTokenExpires}`);
      
      response.cookie('Authentication', accessToken, {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: 'lax',
        path: '/',
        expires: accessTokenExpires,
      });

      this.logger.log(`🍪 Setando cookie RefreshToken com expiração: ${refreshTokenExpires}`);
      
      response.cookie('RefreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: 'lax',
        path: '/',
        expires: refreshTokenExpires,
      });

      this.logger.log(`✅ Cookies httpOnly setados: ${user.email}`);

      // 8️⃣ Retornar response com access token + refresh token
      return {
        user: user.name,
        email: user.email,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao fazer login: ${errorMessage}`);
      throw error;
    }
  }
}
