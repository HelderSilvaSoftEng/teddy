import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import type { ICurrentUser, LogoutResponse } from '../../domain/types';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';

/**
 * LogoutUseCase - Invalida refresh token
 * 
 * Fluxo:
 * 1. Buscar cliente
 * 2. Zerar refreshTokenHash
 * 3. Zerar refreshTokenExpires
 * 4. Salvar no BD
 */
@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
  ) {}

  async execute(user: ICurrentUser, response: Response): Promise<LogoutResponse> {
    try {
      this.logger.log(`👋 Iniciando logout para: ${user.email}`);

      // 1️⃣ Buscar cliente
      const user = await this.userRepository.findById(user.id);
      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      // 2️⃣ Zerar refresh token no cliente
      user.refreshTokenHash = undefined;
      user.refreshTokenExpires = undefined;
      user.updatedAt = new Date();

      // 3️⃣ Salvar no BD
      await this.userRepository.update(user.id, client);

      // 4️⃣ Limpar cookies
      response.clearCookie('Authentication', { path: '/' });
      response.clearCookie('RefreshToken', { path: '/' });

      this.logger.log(`✅ Logout concluído: ${user.email}`);

      return {
        message: 'Logout realizado com sucesso',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao fazer logout: ${errorMessage}`);
      throw error;
    }
  }
}
