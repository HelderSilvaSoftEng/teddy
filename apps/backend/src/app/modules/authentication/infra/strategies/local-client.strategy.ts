import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Inject } from '@nestjs/common';
import type { IClientRepositoryPort } from '../../../clients/domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../../clients/domain/ports/client.repository.port';

/**
 * LocalClientStrategy - Valida email + password
 * Usado pelo LocalClientAuthGuard no endpoint /login
 */
@Injectable()
export class LocalClientStrategy extends PassportStrategy(Strategy, 'clients') {
  private readonly logger = new Logger(LocalClientStrategy.name);

  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {
    super({
      usernameField: 'email',      // 🔷 Campo de email
      passwordField: 'password',   // 🔷 Campo de senha
    });
  }

  /**
   * Valida credenciais do cliente
   * Passport chama automaticamente com email e password do body
   */
  async validate(email: string, password: string) {
    try {
      // 1️⃣ Buscar cliente pelo email
      const client = await this.clientRepository.findByEmail(email);

      if (!client) {
        this.logger.warn(`❌ Login attempt com email não encontrado: ${email}`);
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      // 2️⃣ Validar se o cliente está ativo
      if (!client.isActive()) {
        this.logger.warn(`❌ Login attempt com cliente inativo: ${email}`);
        throw new UnauthorizedException('Cliente inativo');
      }

      // 3️⃣ Validar senha usando método da entity
      if (!client.isPasswordValid(password)) {
        this.logger.warn(`❌ Login attempt com senha incorreta: ${email}`);
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      this.logger.log(`✅ Cliente autenticado: ${email}`);

      // 4️⃣ Retornar cliente para o guard
      return {
        id: client.id,
        email: client.email,
        name: client.userName || client.email,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`❌ Erro ao validar credenciais: ${error.message}`);
      throw new UnauthorizedException('Erro ao validar credenciais');
    }
  }
}
