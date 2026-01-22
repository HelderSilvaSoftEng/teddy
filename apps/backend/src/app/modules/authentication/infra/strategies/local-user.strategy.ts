import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Inject } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import type { ICurrentUser } from '../../domain/types';

@Injectable()
export class LocalUserStrategy extends PassportStrategy(Strategy, 'users') {
  private readonly logger = new Logger(LocalUserStrategy.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<ICurrentUser> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        this.logger.warn(`❌ Login attempt com email não encontrado: ${email}`);
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      if (!user.isActive()) {
        this.logger.warn(`❌ Login attempt com usuário inativo: ${email}`);
        throw new UnauthorizedException('Usuário inativo');
      }

      if (!user.isPasswordValid(password)) {
        this.logger.warn(`❌ Login attempt com senha incorreta: ${email}`);
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      this.logger.log(`✅ Usuário autenticado: ${email}`);

      const currentUser: ICurrentUser = {
        id: user.id,
        email: user.email,
        name: user.email,
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
