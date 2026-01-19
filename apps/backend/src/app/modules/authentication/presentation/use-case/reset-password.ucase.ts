import { Injectable, Logger, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IClientRepositoryPort } from '../../../clients/domain/ports/client.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from '../../../clients/domain/ports/client.repository.port';
import { Client } from '../../../clients/domain/entities/client.entity';
import type { RecoveryTokenPayload } from '../../domain/types';

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepositoryPort,
  ) {}

  async execute(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      this.logger.log('🔐 Iniciando reset de senha');

      // 1️⃣ Validar token JWT
      let payload: RecoveryTokenPayload;
      try {
        const recoveryTokenSecret = this.configService.get<string>('RECOVERY_TOKEN_SECRET');
        payload = this.jwtService.verify<RecoveryTokenPayload>(token, {
          secret: recoveryTokenSecret,
        });
        this.logger.log(`✅ Token válido para usuário: ${payload.email}`);
      } catch (error) {
        this.logger.warn(`❌ Token inválido ou expirado`);
        throw new UnauthorizedException('Link de recuperação inválido ou expirado');
      }

      // 2️⃣ Buscar cliente
      const client = await this.clientRepository.findById(payload.sub);
      if (!client) {
        this.logger.warn(`⚠️ Cliente não encontrado: ${payload.sub}`);
        throw new BadRequestException('Usuário não encontrado');
      }

      // 3️⃣ Validar se o token hash coincide (prevenção contra uso de tokens inválidos)
      if (!client.recoveryTokenHash) {
        this.logger.warn(`⚠️ Nenhum token de recuperação ativo para: ${payload.email}`);
        throw new UnauthorizedException('Token de recuperação não encontrado ou expirado');
      }

      const tokenHashFromDb = client.recoveryTokenHash;
      const tokenHashFromRequest = Client.hashPassword(token);

      // ⚠️ NOTA: Em produção, seria melhor usar bcrypt.compare()
      // Por agora usamos comparação direta do hash SHA256
      if (tokenHashFromDb !== tokenHashFromRequest) {
        this.logger.warn(`⚠️ Token não corresponde ao hash do BD para: ${payload.email}`);
        throw new UnauthorizedException('Token inválido');
      }

      // 4️⃣ Verificar expiração do token
      if (client.recoveryTokenExpires && client.recoveryTokenExpires < new Date()) {
        this.logger.warn(`⚠️ Token expirado para: ${payload.email}`);
        throw new UnauthorizedException('Link de recuperação expirado');
      }

      // 5️⃣ Hash a nova senha
      const hashedPassword = Client.hashPassword(newPassword);

      // 6️⃣ Atualizar senha e limpar tokens de recuperação
      client.password = hashedPassword;
      client.recoveryTokenHash = null;
      client.recoveryTokenExpires = null;

      await this.clientRepository.update(client.id, client);
      this.logger.log(`✅ Senha alterada com sucesso para: ${payload.email}`);

      return { message: 'Senha alterada com sucesso. Você pode fazer login com sua nova senha.' };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao resetar senha: ${errorMessage}`);
      throw error;
    }
  }
}
