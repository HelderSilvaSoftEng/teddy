import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import type { IClientRepositoryPort } from '../../domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../domain/ports/client.repository.port';
import type { ChangePasswordDto } from '../../adapters/dtos/change-password.dto';
import type { IChangePasswordPort } from '../ports/change-password.port';

/**
 * ChangePasswordUseCase - Lógica para alterar a senha de um cliente
 */
@Injectable()
export class ChangePasswordUseCase implements IChangePasswordPort {
  private readonly logger = new Logger(ChangePasswordUseCase.name);

  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(id: string, input: ChangePasswordDto): Promise<{ message: string }> {
    try {
      // 1️⃣ Validar que as senhas conferem
      if (input.newPassword !== input.confirmPassword) {
        throw new BadRequestException('As novas senhas não conferem');
      }

      // 2️⃣ Validar que a nova senha é diferente da atual
      if (input.currentPassword === input.newPassword) {
        throw new BadRequestException('A nova senha não pode ser igual à senha atual');
      }

      // 3️⃣ Buscar cliente
      const client = await this.clientRepository.findById(id);

      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      // 4️⃣ Verificar se a senha atual está correta usando método da entity
      if (!client.isPasswordValid(input.currentPassword)) {
        this.logger.warn(`❌ Tentativa de alterar senha com senha atual incorreta: ${id}`);
        throw new BadRequestException('Senha atual incorreta');
      }

      this.logger.log(`🔐 Alterando senha do cliente: ${id}`);

      // 5️⃣ Definir nova senha usando método da entity
      client.setPassword(input.newPassword);
      client.updatedAt = new Date();

      // 6️⃣ Salvar no repositório
      await this.clientRepository.update(id, client);

      this.logger.log(`✅ Senha do cliente alterada com sucesso: ${id}`);

      return { message: 'Senha alterada com sucesso' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao alterar senha: ${errorMessage}`);
      throw error;
    }
  }
}
