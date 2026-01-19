import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

/**
 * FindAllUsersUseCase - Listar todos os usuários com paginação
 *
 * Fluxo:
 * 1. Buscar usuários com paginação (skip, take)
 * 2. Retornar dados e total
 */
@Injectable()
export class FindAllUsersUseCase {
  private readonly logger = new Logger(FindAllUsersUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
  ) {}

  async execute(
    skip = 0,
    take = 10,
  ): Promise<{ data: User[]; total: number }> {
    try {
      this.logger.log(`📋 Listando usuários: skip=${skip}, take=${take}`);

      const result = await this.UserRepository.findAll(skip, take);

      this.logger.log(
        `✅ ${result.data.length} usuário(s) encontrado(s) de ${result.total}`,
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao listar usuários: ${errorMessage}`);
      throw error;
    }
  }
}
