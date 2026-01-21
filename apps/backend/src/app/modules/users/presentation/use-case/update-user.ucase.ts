import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../../adapters/dtos/update-user.dto';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { getTracer } from '../../../../../app/telemetry';

/**
 * UpdateUserUseCase - Lógica para atualizar um usuário existente
 */
@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);
  private readonly tracer = getTracer();

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const span = this.tracer.startSpan('update_user_process', {
      attributes: {
        'user.id': id,
        'operation': 'UPDATE_USER',
      },
    });

    try {
      // 1️⃣ Buscar usuário
      const findSpan = this.tracer.startSpan('find_user_by_id', { parent: span });
      const user = await this.UserRepository.findById(id);
      findSpan.end();

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      this.logger.log(`📝 Atualizando usuário: ${id}`);

      // 2️⃣ Atualizar dados usando método da entidade
      user.update(updateUserDto);

      // 3️⃣ Salvar no repositório
      const updateSpan = this.tracer.startSpan('update_user_repository', { parent: span });
      const updated = await this.UserRepository.update(id, user);
      updateSpan.end();

      this.logger.log(`✅ Usuário atualizado com sucesso: ${id}`);

      const auditSpan = this.tracer.startSpan('audit_update_user', { parent: span });
      try {
        await this.logAuditUseCase.execute({
          userId: id,
          userEmail: updated.email,
          action: 'UPDATE',
          entityType: 'User',
          entityId: id,
          oldValues: user,
          newValues: updated,
          ipAddress: '',
          userAgent: '',
          endpoint: '/api/v1/users/:id',
          httpMethod: 'PUT',
          status: '200',
          errorMessage: null,
        });
      } catch {
        // Silently fail to not break main operation
      } finally {
        auditSpan.end();
      }

      span.setAttributes({
        'status': 200,
      });

      return updated;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao atualizar usuário: ${errorMessage}`);
      span.recordException(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    } finally {
      span.end();
    }
  }
}
