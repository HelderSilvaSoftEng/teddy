import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import type { ChangePasswordDto } from '../../adapters/dtos/change-password.dto';
import type { IChangePasswordPort } from '../ports/change-password.port';
import { BadRequestException, NotFoundException } from '../../../../../common/exceptions';

/**
 * ChangePasswordUseCase - Lógica para alterar a senha de um usuário
 */
@Injectable()
export class ChangePasswordUseCase implements IChangePasswordPort {
  private readonly logger = new Logger(ChangePasswordUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
  ) {}

  async execute(id: string, input: ChangePasswordDto): Promise<{ message: string }> {
    try {
      if (input.newPassword !== input.confirmPassword) {
        throw new BadRequestException('As novas senhas não conferem', {
          field: 'confirmPassword',
        });
      }

      if (input.currentPassword === input.newPassword) {
        throw new BadRequestException('A nova senha não pode ser igual à senha atual', {
          field: 'newPassword',
        });
      }

      const user = await this.UserRepository.findById(id);

      if (!user) {
        throw new NotFoundException('Usuário não encontrado', {
          entityType: 'User',
          id,
        });
      }

      if (!user.isPasswordValid(input.currentPassword)) {
        this.logger.warn(`❌ Tentativa de alterar senha com senha atual incorreta: ${id}`);
        throw new BadRequestException('Senha atual incorreta', {
          field: 'currentPassword',
        });
      }

      this.logger.log(`🔐 Alterando senha do usuário: ${id}`);

      user.setPassword(input.newPassword);
      user.updatedAt = new Date();

      await this.UserRepository.update(id, user);

      this.logger.log(`✅ Senha do usuário alterada com sucesso: ${id}`);

      return { message: 'Senha alterada com sucesso' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao alterar senha: ${errorMessage}`);
      throw error;
    }
  }
}
