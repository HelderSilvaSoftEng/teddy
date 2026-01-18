import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IClientRepositoryPort } from '../../domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../domain/ports/client.repository.port';
import { Client } from '../../domain/entities/client.entity';

/**
 * FindAllClientsUseCase - Listar todos os clientes com paginação
 *
 * Fluxo:
 * 1. Buscar clientes com paginação (skip, take)
 * 2. Retornar dados e total
 */
@Injectable()
export class FindAllClientsUseCase {
  private readonly logger = new Logger(FindAllClientsUseCase.name);

  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(
    skip = 0,
    take = 10,
  ): Promise<{ data: Client[]; total: number }> {
    try {
      this.logger.log(`📋 Listando clientes: skip=${skip}, take=${take}`);

      const result = await this.clientRepository.findAll(skip, take);

      this.logger.log(
        `✅ ${result.data.length} cliente(s) encontrado(s) de ${result.total}`,
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao listar clientes: ${errorMessage}`);
      throw error;
    }
  }
}
