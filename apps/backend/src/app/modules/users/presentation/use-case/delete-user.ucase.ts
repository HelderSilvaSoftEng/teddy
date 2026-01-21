import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';

/**
 * DeleteUserUseCase - Deletar (soft-delete) um usuário
 *
 * Fluxo:
 * 1. Verificar se usuário existe
 * 2. Deletar usuário (soft-delete via deletedAt)
 * 3. Confirmação
 */
@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      // 1️⃣ Verificar se usuário existe
      const user = await this.UserRepository.findById(id);

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      this.logger.log(`🗑️ Deletando usuário: ${id}`);

      // 2️⃣ Deletar usuário (soft-delete)
      await this.UserRepository.delete(id);

      this.logger.log(`✅ Usuário deletado com sucesso: ${id}`);

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
      } catch {
        // Silently fail to not break main operation
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao deletar usuário: ${errorMessage}`);
      throw error;
    }
  }
}
