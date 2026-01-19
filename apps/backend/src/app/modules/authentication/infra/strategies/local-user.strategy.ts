import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Inject } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import type { ICurrentUser } from '../../domain/types';

/**
 * LocalUserStrategy - Valida email + password
 * Usado pelo LocalUserAuthGuard no endpoint /login
 */
@Injectable()
export class LocalUserStrategy extends PassportStrategy(Strategy, 'users') {
  private readonly logger = new Logger(LocalUserStrategy.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
  ) {
    super({
      usernameField: 'email',      // 🔷 Campo de email
      passwordField: 'password',   // 🔷 Campo de senha
    });
  }

  /**
   * Valida credenciais do usuário
   * Passport chama automaticamente com email e password do body
   */
  async validate(email: string, password: string): Promise<ICurrentUser> {
    try {
      // 1️⃣ Buscar usuário pelo email
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        this.logger.warn(`❌ Login attempt com email não encontrado: ${email}`);
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      // 2️⃣ Validar se o usuário está ativo
      if (!user.isActive()) {
        this.logger.warn(`❌ Login attempt com usuário inativo: ${email}`);
        throw new UnauthorizedException('Usuário inativo');
      }

      // 3️⃣ Validar senha usando método da entity
      if (!user.isPasswordValid(password)) {
        this.logger.warn(`❌ Login attempt com senha incorreta: ${email}`);
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      this.logger.log(`✅ Usuário autenticado: ${email}`);

      // 4️⃣ Retornar usuário para o guard
      const currentUser: ICurrentUser = {
        id: user.id,
        email: user.email,
        name: user.userName || user.email,
      };

      return currentUser;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao validar credenciais: ${errorMessage}`);
      throw new UnauthorizedException('Erro ao validar credenciais');
    }
  }
}
