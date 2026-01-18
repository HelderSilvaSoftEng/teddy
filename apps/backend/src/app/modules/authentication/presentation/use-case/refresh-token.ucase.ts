import { Injectable, Logger, UnauthorizedException, Inject, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import type { RefreshTokenPayload, RefreshResponse } from '../../domain/types';
import type { IClientRepositoryPort } from '../../../clients/domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../../clients/domain/ports/client.repository.port';

/**
 * RefreshTokenUseCase - Rotaciona tokens JWT
 * 
 * Fluxo:
 * 1. Extrai e valida refresh token do cookie
 * 2. Valida payload (sub, jti, typ='refresh')
 * 3. Compara JTI hash com hash no BD
 * 4. Valida expiração
 * 5. Gera novo Access Token
 * 6. Rotaciona Refresh Token (novo JTI)
 * 7. Salva novo hash no BD
 * 8. Seta novo cookie
 */
@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(refreshToken: string, response: Response): Promise<RefreshResponse> {
    try {
      // 1️⃣ Validar e decodificar refresh token
      if (!refreshToken) {
        throw new BadRequestException('Refresh token não fornecido');
      }

      let decoded: RefreshTokenPayload;

      try {
        decoded = this.jwtService.verify(refreshToken, {
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        }) as RefreshTokenPayload;
      } catch (error) {
        this.logger.warn('❌ Refresh token inválido ou expirado');
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      // 2️⃣ Validar payload
      if (!decoded.sub || decoded.typ !== 'refresh' || !decoded.jti) {
        throw new UnauthorizedException('Refresh token malformado');
      }

      this.logger.log(`🔄 Iniciando refresh para cliente: ${decoded.sub}`);

      // 3️⃣ Buscar cliente no BD
      const client = await this.clientRepository.findById(decoded.sub);
      if (!client) {
        throw new UnauthorizedException('Cliente não encontrado');
      }

      // 4️⃣ Validar refresh token hash (JTI vs hash no BD)
      if (!client.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token não configurado');
      }

      // Comparar JTI com o hash usando método da entity
      const currentJtiHash = client.constructor.hashPassword(decoded.jti);
      if (currentJtiHash !== client.refreshTokenHash) {
        this.logger.warn(`❌ JTI hash não corresponde para cliente: ${client.id}`);
        throw new UnauthorizedException('Refresh token revogado');
      }

      // 5️⃣ Validar expiração
      if (!client.refreshTokenExpires || new Date() > client.refreshTokenExpires) {
        throw new UnauthorizedException('Refresh token expirado');
      }

      this.logger.log(`✅ Refresh token validado com sucesso`);

      // 6️⃣ Gerar novo Access Token
      const accessTokenTtl = this.configService.get('JWT_EXPIRATION', 900);
      const newAccessToken = this.jwtService.sign(
        {
          sub: client.id,
          email: client.email,
          name: client.userName || client.email,
        },
        {
          expiresIn: accessTokenTtl,
          secret: this.configService.get('JWT_SECRET'),
        },
      );

      this.logger.log(`✅ Novo Access Token gerado`);

      // 7️⃣ Rotacionar Refresh Token (novo JTI)
      const newJti = randomUUID();
      const refreshTokenTtl = this.configService.get('REFRESH_TOKEN_TTL', 604800);

      const newRefreshPayload = {
        sub: client.id,
        jti: newJti,
        typ: 'refresh',
      };

      const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
        expiresIn: refreshTokenTtl,
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      // 8️⃣ Hash do novo JTI
      const newJtiHash = client.constructor.hashPassword(newJti);

      // 9️⃣ Salvar novo hash no BD
      client.refreshTokenHash = newJtiHash;
      client.refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);

      await this.clientRepository.update(client.id, client);

      this.logger.log(`✅ Novo Refresh Token hash salvo`);

      // 🔟 Setar novo cookie
      response.cookie('Authentication', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: refreshTokenTtl * 1000,
      });

      this.logger.log(`✅ Token rotacionado com sucesso`);

      return {
        accessToken: newAccessToken,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao fazer refresh: ${errorMessage}`);
      throw error;
    }
  }
}
