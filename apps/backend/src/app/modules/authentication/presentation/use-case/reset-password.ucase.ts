import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';
import { User } from "../../../users/domain/entities/user.entity";
import type { RecoveryTokenPayload } from '../../domain/types';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { UnauthorizedException, BadRequestException, NotFoundException } from '../../../../../common/exceptions';

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(token: string, newPassword: string, request?: Request): Promise<{ message: string }> {
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
      } catch {
        this.logger.warn(`❌ Token inválido ou expirado`);
        throw new UnauthorizedException('Link de recuperação inválido ou expirado');
      }

      // 2️⃣ Buscar cliente
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        this.logger.warn(`⚠️ Cliente não encontrado: ${payload.sub}`);
        throw new NotFoundException('Usuário não encontrado', { entityType: 'User', id: payload.sub });
      }

      // 3️⃣ Validar se o token hash coincide (prevenção contra uso de tokens inválidos)
      if (!user.recoveryTokenHash) {
        this.logger.warn(`⚠️ Nenhum token de recuperação ativo para: ${payload.email}`);
        throw new UnauthorizedException('Token de recuperação não encontrado ou expirado');
      }

      const tokenHashFromDb = user.recoveryTokenHash;
      const tokenHashFromRequest = User.hashPassword(token);

      // ⚠️ NOTA: Em produção, seria melhor usar bcrypt.compare()
      // Por agora usamos comparação direta do hash SHA256
      if (tokenHashFromDb !== tokenHashFromRequest) {
        this.logger.warn(`⚠️ Token não corresponde ao hash do BD para: ${payload.email}`);
        throw new UnauthorizedException('Token inválido');
      }

      // 4️⃣ Verificar expiração do token
      if (user.recoveryTokenExpires && user.recoveryTokenExpires < new Date()) {
        this.logger.warn(`⚠️ Token expirado para: ${payload.email}`);
        throw new UnauthorizedException('Link de recuperação expirado');
      }

      // 5️⃣ Hash a nova senha
      const hashedPassword = User.hashPassword(newPassword);

      // 6️⃣ Atualizar senha e limpar tokens de recuperação
      user.password = hashedPassword;
      user.recoveryTokenHash = undefined;
      user.recoveryTokenExpires = undefined;

      await this.userRepository.update(user.id, user);
      this.logger.log(`✅ Senha alterada com sucesso para: ${payload.email}`);

      // 7️⃣ Registrar auditoria de reset de senha
      try {
        await this.logAuditUseCase.execute({
          userId: user.id,
          userEmail: user.email,
          action: 'RESET_PASSWORD',
          entityType: 'User',
          entityId: user.id,
          oldValues: null,
          newValues: null,
          ipAddress: request?.ip || 'unknown',
          userAgent: request?.get('user-agent') || 'unknown',
          endpoint: '/api/auth/reset-password',
          httpMethod: 'POST',
          status: '200',
          errorMessage: null,
        });
        this.logger.log(`✅ Auditoria de reset de senha registrada: ${payload.email}`);
      } catch (auditError: unknown) {
        const auditErrorMsg = auditError instanceof Error ? auditError.message : String(auditError);
        this.logger.warn(`⚠️ Falha ao registrar auditoria de reset: ${auditErrorMsg}`);
      }

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
