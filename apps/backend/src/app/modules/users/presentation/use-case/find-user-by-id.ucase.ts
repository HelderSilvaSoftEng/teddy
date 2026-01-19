import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

/**
 * FindUserByIdUseCase - Buscar usuário por ID
 *
 * Fluxo:
 * 1. Buscar usuário no repositório
 * 2. Incrementar contador de acessos
 * 3. Retornar usuário
 */
@Injectable()
export class FindUserByIdUseCase {
  private readonly logger = new Logger(FindUserByIdUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
  ) {}

  async execute(id: string): Promise<User> {
    try {
      // 1️⃣ Buscar usuário
      const user = await this.UserRepository.findById(id);

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      this.logger.log(`👁️ Usuário acessado: ${id}`);

      return user;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao buscar usuário: ${errorMessage}`);
      throw error;
    }
  }
}
