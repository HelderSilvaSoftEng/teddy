import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import type { ICurrentUser, TokenPayloadUser, LoginResponse } from '../../domain/types';
import type { IClientRepositoryPort } from '../../../clients/domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../../clients/domain/ports/client.repository.port';

/**
 * LoginUseCase - Gera tokens JWT e seta cookie com refresh token
 * 
 * Fluxo:
 * 1. Recebe cliente validado do guard
 * 2. Gera Access Token (15 min) com payload curto
 * 3. Gera Refresh Token (7 dias) com JTI único
 * 4. Hash o JTI com SHA256 e salva no BD
 * 5. Seta cookie httpOnly com refresh token
 * 6. Retorna response com access token no body
 */
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
      const jti = randomUUID();  // ID único para revogação
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

      // 5️⃣ Hash do JTI usando o método da entity
      const hashedJti = client.constructor.hashPassword(jti);

      // 6️⃣ Salvar refresh token hash no cliente
      client.refreshTokenHash = hashedJti;
      client.refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);

      await this.clientRepository.update(user.id, client);

      this.logger.log(`✅ Refresh token hash salvo no BD: ${user.email}`);

      // 7️⃣ Setar cookie httpOnly com refresh token
      response.cookie('Authentication', refreshToken, {
        httpOnly: true,        // 🔐 Não acessível por JavaScript
        secure: true,          // 🔐 Apenas HTTPS (em produção)
        sameSite: 'strict',    // 🔐 CSRF protection
        path: '/',
        maxAge: refreshTokenTtl * 1000,  // 7 dias em milisegundos
      });

      this.logger.log(`✅ Cookie httpOnly setado: ${user.email}`);

      // 8️⃣ Retornar response com access token
      const loginResponse: LoginResponse = {
        user: user.name,
        email: user.email,
        accessToken,  // 🔷 Enviado no body
        // 🔷 Refresh token vem via Set-Cookie no header
      };

      this.logger.log(`✅ Login concluído com sucesso: ${user.email}`);

      return loginResponse;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao fazer login: ${errorMessage}`);
      throw error;
    }
  }
}
