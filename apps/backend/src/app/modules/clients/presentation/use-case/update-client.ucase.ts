import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import type { IClientRepositoryPort } from '../../domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../domain/ports/client.repository.port';
import { Client } from '../../domain/entities/client.entity';
import { UpdateClientDto } from '../../adapters/dtos/update-client.dto';

/**
 * UpdateClientUseCase - Lógica para atualizar um cliente existente
 */
@Injectable()
export class UpdateClientUseCase {
  private readonly logger = new Logger(UpdateClientUseCase.name);

  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    try {
      // 1️⃣ Buscar cliente
      const client = await this.clientRepository.findById(id);

      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      this.logger.log(`📝 Atualizando cliente: ${id}`);

      // 2️⃣ Atualizar dados usando método da entidade
      client.update(updateClientDto);

      // 3️⃣ Salvar no repositório
      const updated = await this.clientRepository.update(id, client);

      this.logger.log(`✅ Cliente atualizado com sucesso: ${id}`);

      return updated;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao atualizar cliente: ${errorMessage}`);
      throw error;
    }
  }
}
