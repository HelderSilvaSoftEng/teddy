import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { passwordRecoveryTemplate } from './templates/password-recovery.html';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: Transporter;
  private isMockMode = false;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    // Em development, ativa mock mode se credenciais estão inválidas
    if (nodeEnv === 'development' && (!host || !port || !user || !pass)) {
      this.isMockMode = true;
      this.logger.warn(
        '⚠️ Email em MOCK MODE (desenvolvimento) - nenhum email será enviado realmente',
      );
      return;
    }

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        '⚠️ Email não configurado - verifique variáveis MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD no .env',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    this.logger.log(`✅ Email transporter inicializado: ${user}@${host}:${port}`);
  }

  /**
   * Envia email de recuperação de senha
   * @param email - Email do usuário
   * @param resetToken - Token JWT para reset
   * @param userName - Nome do usuário
   */
  async sendPasswordRecoveryEmail(
    email: string,
    resetToken: string,
    userName: string,
  ): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      const html = passwordRecoveryTemplate(userName, resetLink);

      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM') || 'noreply@teddy.com',
        to: email,
        subject: '🔐 Recuperação de Senha - Teddy',
        html,
      };

      // Mock mode: só loga sem enviar
      if (this.isMockMode) {
        this.logger.log(
          `📧 [MOCK] Email enviado para ${email}\n📝 Token: ${resetToken}\n🔗 Link: ${resetLink}`,
        );
        return;
      }

      // Modo real: envia via Nodemailer
      if (!this.transporter) {
        this.logger.error('❌ Email transporter não foi inicializado');
        throw new Error('Email service not configured');
      }

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email enviado para ${email}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar email para ${email}:`, error);
      throw error;
    }
  }

  /**
   * Testa a conexão do email
   */
  async testConnection(): Promise<void> {
    if (this.isMockMode) {
      this.logger.log('✅ [MOCK] Conexão de email em mock mode');
      return;
    }

    if (!this.transporter) {
      this.logger.error('❌ Email transporter não foi inicializado');
      return;
    }

    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexão de email verificada com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao verificar conexão de email:', error);
    }
  }
}

