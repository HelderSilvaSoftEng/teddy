import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../../../common/services/email/email.service';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import { User } from "../../../users/domain/entities/user.entity";
import type { RecoveryTokenPayload } from '../../domain/types';

@Injectable()
export class RecoveryPasswordUseCase {
  private readonly logger = new Logger(RecoveryPasswordUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    try {
      this.logger.log(`🔐 Iniciando recuperação de senha para: ${email}`);

      // 1️⃣ Buscar cliente por email
      const user = await this.userRepository.findByEmail(email);
      if (!client) {
        // Por segurança, retornar mensagem genérica mesmo se email não existe
        this.logger.warn(`⚠️ Tentativa de recuperação para email inexistente: ${email}`);
        return { message: 'Se o email existe, você receberá instruções para recuperar sua senha.' };
      }

      // 2️⃣ Gerar token JWT para recuperação (30 minutos de validade)
      const recoveryTokenTtl = this.configService.get<number>('RECOVERY_TOKEN_TTL') ?? 1800; // 30 min
      const recoveryTokenSecret = this.configService.get<string>('RECOVERY_TOKEN_SECRET');

      const payload: RecoveryTokenPayload = {
        sub: user.id,
        email: user.email,
        type: 'recovery',
      };

      const recoveryToken = this.jwtService.sign(payload, {
        expiresIn: `${recoveryTokenTtl}s`,
        secret: recoveryTokenSecret,
      });

      this.logger.log(`✅ Token de recuperação gerado para: ${email}`);

      // 3️⃣ Hash do token para armazenar no BD (segurança)
      const recoveryTokenHash = user.hashPassword(recoveryToken);
      user.recoveryTokenHash = recoveryTokenHash;
      user.recoveryTokenExpires = new Date(Date.now() + recoveryTokenTtl * 1000);

      await this.userRepository.update(user.id, user);
      this.logger.log(`✅ Hash do token salvo no BD para: ${email}`);

      // 4️⃣ Enviar email com link de reset
      await this.emailService.sendPasswordRecoveryEmail(
        user.email,
        recoveryToken,
        user.userName || 'Usuário',
      );

      this.logger.log(`✅ Email de recuperação enviado para: ${email}`);

      return {
        message: 'Se o email existe, você receberá instruções para recuperar sua senha.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao processar recuperação de senha: ${errorMessage}`);
      throw error;
    }
  }
}
