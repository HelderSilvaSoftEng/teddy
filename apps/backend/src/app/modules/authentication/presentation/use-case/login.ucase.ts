import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { randomUUID } from 'crypto';
import type { ICurrentUser, TokenPayloadUser, LoginResponse } from '../../domain/types';
import type { IClientRepositoryPort } from '../../../clients/domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../../clients/domain/ports/client.repository.port';
import { Client } from '../../../clients/domain/entities/client.entity';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(user: ICurrentUser, response: Response): Promise<LoginResponse> {
    try {
      this.logger.log(`🔐 Iniciando login para: ${user.email}`);

      // 1️⃣ Buscar cliente no BD para ter dados atualizados
      const client = await this.clientRepository.findById(user.id);
      if (!client) {
        throw new Error('Cliente não encontrado');
      }

      // 2️⃣ Preparar payload do Access Token (curta duração - 15 min)
      const accessTokenPayload: TokenPayloadUser = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };

      // 3️⃣ Gerar Access Token (15 minutos)
      const accessTokenTtl = this.configService.get('JWT_EXPIRATION', 900); // 15 min
      const accessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: accessTokenTtl,
        secret: this.configService.get('JWT_SECRET'),
      });

      this.logger.log(`✅ Access Token gerado: ${user.email}`);

      // 4️⃣ Gerar Refresh Token (7 dias) com JTI único
      const jti = randomUUID();
      const refreshTokenTtl = this.configService.get('REFRESH_TOKEN_TTL', 604800); // 7 dias

      const refreshTokenPayload = {
        sub: user.id,
        jti,
        typ: 'refresh',
      };

      const refreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: refreshTokenTtl,
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      this.logger.log(`✅ Refresh Token gerado: ${user.email}`);

      // 5️⃣ Hash do JTI usando o método estático da entity
      const hashedJti = Client.hashPassword(jti);

      // 6️⃣ Salvar refresh token hash no cliente
      client.refreshTokenHash = hashedJti;
      client.refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);

      await this.clientRepository.update(user.id, client);

      this.logger.log(`✅ Refresh token hash salvo no BD: ${user.email}`);

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
