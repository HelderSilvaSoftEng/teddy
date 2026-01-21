import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { randomUUID } from 'crypto';
import type { RefreshTokenPayload, RefreshResponse } from '../../domain/types';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import { User } from "../../../users/domain/entities/user.entity";
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../../../../../common/exceptions';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(refreshToken: string, response: Response, request?: Request): Promise<RefreshResponse> {
    try {
      // 1️⃣ Validar e decodificar refresh token
      if (!refreshToken) {
        throw new BadRequestException('Refresh token não fornecido', {
          field: 'refreshToken',
        });
      }

      let decoded: RefreshTokenPayload;

      try {
        decoded = this.jwtService.verify(refreshToken, {
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        }) as RefreshTokenPayload;
      } catch (error) {
        this.logger.warn('❌ Refresh token inválido ou expirado', error);
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      // 2️⃣ Validar payload
      if (!decoded.sub || decoded.typ !== 'refresh' || !decoded.jti) {
        throw new UnauthorizedException('Refresh token malformado');
      }

      this.logger.log(`🔄 Iniciando refresh para cliente: ${decoded.sub}`);

      // 3️⃣ Buscar cliente no BD
      const user = await this.userRepository.findById(decoded.sub);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado', {
          entityType: 'User',
          id: decoded.sub,
        });
      }

      // 4️⃣ Validar refresh token hash (JTI vs hash no BD)
      if (!user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token não configurado');
      }

      const currentJtiHash = User.hashPassword(decoded.jti);
      if (currentJtiHash !== user.refreshTokenHash) {
        this.logger.warn(`❌ JTI hash não corresponde para cliente: ${user.id}`);
        throw new UnauthorizedException('Refresh token revogado');
      }

      // 5️⃣ Validar expiração
      if (!user.refreshTokenExpires || new Date() > user.refreshTokenExpires) {
        throw new UnauthorizedException('Refresh token expirado');
      }

      this.logger.log(`✅ Refresh token validado com sucesso`);

      // 6️⃣ Gerar novo Access Token
      const accessTokenTtl = this.configService.get('JWT_EXPIRATION', 900);
      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          name: user.email,
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
        sub: user.id,
        jti: newJti,
        typ: 'refresh',
      };

      const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
        expiresIn: refreshTokenTtl,
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      // 8️⃣ Hash do novo JTI
      const newJtiHash = User.hashPassword(newJti);

      // 9️⃣ Salvar novo hash no BD
      user.refreshTokenHash = newJtiHash;
      user.refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);

      await this.userRepository.update(user.id, user);

      this.logger.log(`✅ Novo Refresh Token hash salvo`);

      // 🔟 Setar novo Access Token no cookie + rotacionar Refresh Token
      const accessTokenExpires = new Date();
      accessTokenExpires.setSeconds(accessTokenExpires.getSeconds() + accessTokenTtl);
      const refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);
      const isProduction = this.configService.get('NODE_ENV') === 'production';

      response.cookie('Authentication', newAccessToken, {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: 'lax',
        path: '/',
        expires: accessTokenExpires,
      });

      response.cookie('RefreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: 'lax',
        path: '/',
        expires: refreshTokenExpires,
      });

      this.logger.log(`✅ Tokens rotacionados com sucesso`);

      // 1️⃣1️⃣ Registrar auditoria de refresh token
      try {
        await this.logAuditUseCase.execute({
          userId: user.id,
          userEmail: user.email,
          action: 'REFRESH_TOKEN',
          entityType: 'User',
          entityId: user.id,
          oldValues: null,
          newValues: null,
          ipAddress: request?.ip || 'unknown',
          userAgent: request?.get('user-agent') || 'unknown',
          endpoint: '/api/auth/refresh',
          httpMethod: 'POST',
          status: '200',
          errorMessage: null,
        });
        this.logger.log(`✅ Auditoria de refresh token registrada: ${user.email}`);
      } catch (auditError: unknown) {
        const auditErrorMsg = auditError instanceof Error ? auditError.message : String(auditError);
        this.logger.warn(`⚠️ Falha ao registrar auditoria de refresh: ${auditErrorMsg}`);
      }

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
