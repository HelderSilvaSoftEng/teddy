import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { randomUUID } from 'crypto';
import type { ICurrentUser, TokenPayloadUser, LoginResponse } from '../../domain/types';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import { User } from "../../../users/domain/entities/user.entity";
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(user: ICurrentUser, response: Response, request?: Request): Promise<LoginResponse> {
    try {
      this.logger.log(`🔐 Iniciando login para: ${user.email}`);

      // 1️⃣ Buscar usuário no BD para ter dados atualizados
      const currentUser = await this.userRepository.findById(user.id);
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }

      // 2️⃣ Preparar payload do Access Token (curta duração - 15 min)
      const accessTokenPayload: TokenPayloadUser = {
        sub: currentUser.id,
        email: currentUser.email,
        name: currentUser.email,
      };

      // 3️⃣ Gerar Access Token
      const accessTokenTtl = this.configService.get<number>('JWT_EXPIRATION') ?? 3600; // 1 hora default
      const accessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: `${accessTokenTtl}s`, // ✅ Converter para string com 's' (segundos)
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.log(`✅ Access Token gerado com TTL ${accessTokenTtl}s: ${currentUser.email}`);

      // 4️⃣ Gerar Refresh Token (7 dias) com JTI único
      const jti = randomUUID();
      const refreshTokenTtl = this.configService.get('REFRESH_TOKEN_TTL', 604800); // 7 dias

      const refreshTokenPayload = {
        sub: currentUser.id,
        jti,
        typ: 'refresh',
      };

      const refreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: `${refreshTokenTtl}s`, // ✅ Converter para string com 's' (segundos)
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') ?? this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.log(`✅ Refresh Token gerado com TTL ${refreshTokenTtl}s: ${currentUser.email}`);

      // 5️⃣ Hash do JTI usando o método estático da entity
      const hashedJti = User.hashPassword(jti);

      // 6️⃣ Incrementar contador de acessos (login count)
      currentUser.incrementAccessCount();

      // 7️⃣ Salvar refresh token hash no usuário
      currentUser.refreshTokenHash = hashedJti;
      currentUser.refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);

      await this.userRepository.update(currentUser.id, currentUser);

      // 8️⃣ Incrementar contador de acessos no repositório (SQL)
      await this.userRepository.incrementAccessCount(currentUser.id);

      this.logger.log(`✅ Refresh token hash e contador de acessos atualizados no BD: ${currentUser.email}`);

      // 9️⃣ Setar cookies httpOnly com tokens
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

      this.logger.log(`✅ Cookies httpOnly setados: ${currentUser.email}`);

      // 🔟 Registrar auditoria de login
      try {
        await this.logAuditUseCase.execute({
          userId: currentUser.id,
          userEmail: currentUser.email,
          action: 'LOGIN',
          entityType: 'User',
          entityId: currentUser.id,
          oldValues: null,
          newValues: { email: currentUser.email, accessCount: currentUser.accessCount },
          ipAddress: request?.ip || 'unknown',
          userAgent: request?.get('user-agent') || 'unknown',
          endpoint: '/api/auth/login',
          httpMethod: 'POST',
          status: '200',
          errorMessage: null,
        });
        this.logger.log(`✅ Auditoria de login registrada: ${currentUser.email}`);
      } catch (auditError: unknown) {
        const auditErrorMsg = auditError instanceof Error ? auditError.message : String(auditError);
        this.logger.warn(`⚠️ Falha ao registrar auditoria de login: ${auditErrorMsg}`);
        // Continuar mesmo se auditoria falhar (não quebra o login)
      }

      // 1️⃣ Retornar response com access token + refresh token + accessCount
      return {
        user: currentUser.email,
        email: currentUser.email,
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessCount: currentUser.accessCount ?? 0,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao fazer login: ${errorMessage}`);
      throw error;
    }
  }
}
