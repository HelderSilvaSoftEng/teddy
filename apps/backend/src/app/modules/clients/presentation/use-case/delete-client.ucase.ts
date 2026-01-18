import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import type { IClientRepositoryPort } from '../../domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../domain/ports/client.repository.port';

/**
 * DeleteClientUseCase - Deletar (soft-delete) um cliente
 *
 * Fluxo:
 * 1. Verificar se cliente existe
 * 2. Deletar cliente (soft-delete via deletedAt)
 * 3. Confirmação
 */
@Injectable()
export class DeleteClientUseCase {
  private readonly logger = new Logger(DeleteClientUseCase.name);

  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      // 1️⃣ Verificar se cliente existe
      const client = await this.clientRepository.findById(id);

      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      this.logger.log(`🗑️ Deletando cliente: ${id}`);

      // 2️⃣ Deletar cliente (soft-delete)
      await this.clientRepository.delete(id);

      this.logger.log(`✅ Cliente deletado com sucesso: ${id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao deletar cliente: ${errorMessage}`);
      throw error;
    }
  }
}
