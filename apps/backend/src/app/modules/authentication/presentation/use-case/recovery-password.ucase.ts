import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { EmailService } from '../../../../../common/services/email/email.service';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import { User } from '../../../users/domain/entities/user.entity';
import type { RecoveryTokenPayload } from '../../domain/types';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';

@Injectable()
export class RecoveryPasswordUseCase {
  private readonly logger = new Logger(RecoveryPasswordUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(email: string, request?: Request): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
         this.logger.warn(`⚠️ Tentativa de recuperação para email inexistente: ${email}`);
        return { message: 'Se o email existe, você receberá instruções para recuperar sua senha.' };
      }

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

      const recoveryTokenHash = User.hashPassword(recoveryToken);
      user.recoveryTokenHash = recoveryTokenHash;
      user.recoveryTokenExpires = new Date(Date.now() + recoveryTokenTtl * 1000);

      await this.userRepository.update(user.id, user);
      this.logger.log(`✅ Hash do token salvo no BD para: ${email}`);

      await this.emailService.sendPasswordRecoveryEmail(
        user.email,
        recoveryToken,
        'Usuário',
      );

      this.logger.log(`✅ Email de recuperação enviado para: ${email}`);

      try {
        await this.logAuditUseCase.execute({
          userId: user.id,
          userEmail: user.email,
          action: 'RECOVERY_PASSWORD',
          entityType: 'User',
          entityId: user.id,
          oldValues: null,
          newValues: null,
          ipAddress: request?.ip || 'unknown',
          userAgent: request?.get('user-agent') || 'unknown',
          endpoint: '/api/auth/recovery-password',
          httpMethod: 'POST',
          status: '200',
          errorMessage: null,
        });
        this.logger.log(`✅ Auditoria de recuperação registrada: ${email}`);
      } catch (auditError: unknown) {
        const auditErrorMsg = auditError instanceof Error ? auditError.message : String(auditError);
        this.logger.warn(`⚠️ Falha ao registrar auditoria de recuperação: ${auditErrorMsg}`);
      }

      return {
        message: 'Se o email existe, você receberá instruções para recuperar sua senha.',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao processar recuperação de senha: ${errorMessage}`);
      throw error;
    }
  }
}
