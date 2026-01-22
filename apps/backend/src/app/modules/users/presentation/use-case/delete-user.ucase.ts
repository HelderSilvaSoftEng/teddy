import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { getTracer } from '../../../../../app/telemetry';
import { NotFoundException } from '../../../../../common/exceptions';

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name);
  private readonly tracer = getTracer();

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const span = this.tracer.startSpan('delete_user_process', {
      attributes: {
        'user.id': id,
        'operation': 'DELETE_USER',
      },
    });

    try {
      const findSpan = this.tracer.startSpan('find_user_by_id', { parent: span });
      const user = await this.UserRepository.findById(id);
      findSpan.end();

      if (!user) {
        throw new NotFoundException('Usuário não encontrado', {
          entityType: 'User',
          id,
        });
      }

      this.logger.log(`🗑️ Deletando usuário: ${id}`);

      const deleteSpan = this.tracer.startSpan('delete_user_repository', { parent: span });
      await this.UserRepository.delete(id);
      deleteSpan.end();

      this.logger.log(`✅ Usuário deletado com sucesso: ${id}`);

      const auditSpan = this.tracer.startSpan('audit_delete_user', { parent: span });
      try {
        await this.logAuditUseCase.execute({
          userId: id,
          userEmail: user.email,
          action: 'DELETE',
          entityType: 'User',
          entityId: id,
          oldValues: user,
          newValues: null,
          ipAddress: '',
          userAgent: '',
          endpoint: '/api/v1/users/:id',
          httpMethod: 'DELETE',
          status: '204',
          errorMessage: null,
        });
      } catch (auditError: unknown) {
        const auditErrorMsg = auditError instanceof Error ? auditError.message : String(auditError);
      } finally {
        auditSpan.end();
      }

      span.setAttributes({
        'status': 204,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao deletar usuário: ${errorMessage}`);
      span.recordException(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    } finally {
      span.end();
    }
  }
}
