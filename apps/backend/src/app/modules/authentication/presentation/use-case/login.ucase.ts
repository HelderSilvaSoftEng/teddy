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
import { getTracer } from '../../../../../app/telemetry';
import { NotFoundException } from '../../../../../common/exceptions';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);
  private readonly tracer = getTracer();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(user: ICurrentUser, response: Response, request?: Request): Promise<LoginResponse> {
    const span = this.tracer.startSpan('login_process', {
      attributes: {
        'user.email': user.email,
        'user.id': user.id,
      },
    });

    try {
      const findUserSpan = this.tracer.startSpan('find_user', {
        parent: span,
        attributes: {
          'db.operation': 'findById',
          'user.id': user.id,
        },
      });

      const currentUser = await this.userRepository.findById(user.id);
      findUserSpan.end();

      if (!currentUser) {
        throw new NotFoundException('Usuário não encontrado', {
          entityType: 'User',
          id: user.id,
        });
      }

      const accessTokenPayload: TokenPayloadUser = {
        sub: currentUser.id,
        email: currentUser.email,
        name: currentUser.email,
      };

      const tokenSpan = this.tracer.startSpan('generate_tokens', { parent: span });

      const accessTokenTtl = this.configService.get<number>('JWT_EXPIRATION') ?? 3600;
      const accessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: `${accessTokenTtl}s`,
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.log(`✅ Access Token gerado com TTL ${accessTokenTtl}s: ${currentUser.email}`);

      const jti = randomUUID();
      const refreshTokenTtl = this.configService.get('REFRESH_TOKEN_TTL', 604800);

      const refreshTokenPayload = {
        sub: currentUser.id,
        jti,
        typ: 'refresh',
      };

      const refreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: `${refreshTokenTtl}s`,
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') ?? this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.log(`✅ Refresh Token gerado com TTL ${refreshTokenTtl}s: ${currentUser.email}`);
      tokenSpan.end();

      const hashSpan = this.tracer.startSpan('hash_jti', { parent: span });
      const hashedJti = User.hashPassword(jti);
      hashSpan.end();

      currentUser.incrementAccessCount();

      currentUser.refreshTokenHash = hashedJti;
      currentUser.refreshTokenExpires = new Date(Date.now() + refreshTokenTtl * 1000);

      const updateUserSpan = this.tracer.startSpan('update_user', {
        parent: span,
        attributes: {
          'db.operation': 'update',
        },
      });

      await this.userRepository.update(currentUser.id, currentUser);

      await this.userRepository.incrementAccessCount(currentUser.id);
      updateUserSpan.end();

      this.logger.log(`✅ Refresh token hash e contador de acessos atualizados no BD: ${currentUser.email}`);

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

      const auditSpan = this.tracer.startSpan('audit_login', {
        parent: span,
        attributes: {
          'audit.action': 'LOGIN',
        },
      });

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
      }

      auditSpan.end();
      span.setAttributes({
        'login.success': true,
        'login.accessCount': currentUser.accessCount,
      });

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
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  }
}
