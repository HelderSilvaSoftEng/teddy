import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../../adapters/dtos/update-user.dto';

/**
 * UpdateUserUseCase - Lógica para atualizar um usuário existente
 */
@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      // 1️⃣ Buscar usuário
      const user = await this.UserRepository.findById(id);

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      this.logger.log(`📝 Atualizando usuário: ${id}`);

      // 2️⃣ Atualizar dados usando método da entidade
      user.update(updateUserDto);

      // 3️⃣ Salvar no repositório
      const updated = await this.UserRepository.update(id, user);

      this.logger.log(`✅ Usuário atualizado com sucesso: ${id}`);

      return updated;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao atualizar usuário: ${errorMessage}`);
      throw error;
    }
  }
}
