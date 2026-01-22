import { Injectable, Logger, Inject } from '@nestjs/common';
import type { Response, Request } from 'express';
import type { ICurrentUser, LogoutResponse } from '../../domain/types';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { NotFoundException } from '../../../../../common/exceptions';

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(user: ICurrentUser, response: Response, request?: Request): Promise<LogoutResponse> {
    try {
      const currentUser = await this.userRepository.findById(user.id);
      if (!currentUser) {
        throw new NotFoundException('Cliente não encontrado', { entityType: 'User', id: user.id });
      }

      currentUser.refreshTokenHash = undefined;
      currentUser.refreshTokenExpires = undefined;
      currentUser.updatedAt = new Date();

      await this.userRepository.update(currentUser.id, currentUser);

      response.clearCookie('Authentication', { path: '/' });
      response.clearCookie('RefreshToken', { path: '/' });

      try {
        await this.logAuditUseCase.execute({
          userId: currentUser.id,
          userEmail: currentUser.email,
          action: 'LOGOUT',
          entityType: 'User',
          entityId: currentUser.id,
          oldValues: null,
          newValues: null,
          ipAddress: request?.ip || 'unknown',
          userAgent: request?.get('user-agent') || 'unknown',
          endpoint: '/api/auth/logout',
          httpMethod: 'POST',
          status: '200',
          errorMessage: null,
        });
        this.logger.log(`✅ Auditoria de logout registrada: ${currentUser.email}`);
      } catch (auditError: unknown) {
        const auditErrorMsg = auditError instanceof Error ? auditError.message : String(auditError);
        this.logger.warn(`⚠️ Falha ao registrar auditoria de logout: ${auditErrorMsg}`);
      }

      this.logger.log(`✅ Logout concluído: ${currentUser.email}`);

      return {
        message: 'Logout realizado com sucesso',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao fazer logout: ${errorMessage}`);
      throw error;
    }
  }
}
