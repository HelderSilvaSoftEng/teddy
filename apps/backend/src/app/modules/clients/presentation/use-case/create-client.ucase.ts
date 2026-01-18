import { Injectable, BadRequestException, Inject, Logger } from '@nestjs/common';
import type { IClientRepositoryPort } from '../../domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../domain/ports/client.repository.port';
import { Client, ClientStatusEnum } from '../../domain/entities/client.entity';
import { CreateClientDto } from '../../adapters/dtos/create-client.dto';

/**
 * CreateClientUseCase - Lógica para criar um novo cliente
 *
 * Fluxo:
 * 1. Validar email único
 * 2. Criar instância da entidade Client
 * 3. Salvar no repositório
 * 4. Retornar cliente criado
 */
@Injectable()
export class CreateClientUseCase {
  private readonly logger = new Logger(CreateClientUseCase.name);

  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(createClientDto: CreateClientDto): Promise<Client> {
    try {
      // 1️⃣ Validar email único
      const existingClient = await this.clientRepository.findByEmail(
        createClientDto.email,
      );

      if (existingClient) {
        throw new BadRequestException('Email já cadastrado');
      }

      // 2️⃣ Criar instância da entidade com dados do DTO
      const client = new Client({
        userName: createClientDto.userName,
        email: createClientDto.email,
        password: Client.hashPassword(createClientDto.password),
        personalId: createClientDto.personalId,
        mobile: createClientDto.mobile,
        status: ClientStatusEnum.ACTIVE,
        accessCount: 0,
      });

      this.logger.log(`📝 Criando cliente: ${client.email}`);

      // 3️⃣ Salvar no repositório
      const createdClient = await this.clientRepository.create(client);

      this.logger.log(`✅ Cliente criado com sucesso: ${createdClient.id}`);

      return createdClient;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao criar cliente: ${errorMessage}`);
      throw error;
    }
  }
}
