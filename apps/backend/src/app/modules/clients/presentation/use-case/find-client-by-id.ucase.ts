import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import type { IClientRepositoryPort } from '../../domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../domain/ports/client.repository.port';
import { Client } from '../../domain/entities/client.entity';

/**
 * FindClientByIdUseCase - Buscar cliente por ID
 *
 * Fluxo:
 * 1. Buscar cliente no repositório
 * 2. Incrementar contador de acessos
 * 3. Retornar cliente
 */
@Injectable()
export class FindClientByIdUseCase {
  private readonly logger = new Logger(FindClientByIdUseCase.name);

  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(id: string): Promise<Client> {
    try {
      // 1️⃣ Buscar cliente
      const client = await this.clientRepository.findById(id);

      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      this.logger.log(`👁️ Cliente acessado: ${id}`);

      return client;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao buscar cliente: ${errorMessage}`);
      throw error;
    }
  }
}
