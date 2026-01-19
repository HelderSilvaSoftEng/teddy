/**
 * 📋 GUIA DE USO - LoggerService com Pino
 * 
 * O LoggerService fornece logs estruturados em JSON (production) 
 * e logs legíveis em desenvolvimento (pino-pretty)
 */

// ✅ INJETAR O LOGGER NO SERVIÇO/USE CASE:
import { Injectable } from '@nestjs/common';
import { LoggerService } from './common/services/logger';

@Injectable()
export class MyUseCase {
  constructor(private readonly logger: LoggerService) {}

  async execute() {
    // ℹ️ Info: Informações gerais
    this.logger.info('Operação iniciada', {
      userId: 'user-123',
      action: 'login',
    });

    // 🔍 Debug: Informações detalhadas (só em LOG_LEVEL=debug)
    this.logger.debug('Dados do usuário recuperados', {
      email: 'user@example.com',
      role: 'admin',
    });

    // ⚠️ Warn: Avisos
    this.logger.warn('Tentativa de acesso com senha incorreta', {
      userId: 'user-123',
      attempts: 3,
    });

    // ❌ Error: Erros
    this.logger.error('Erro ao atualizar usuário', new Error('DB connection failed'));
    
    // ou com contexto customizado:
    this.logger.error('Erro ao enviar email', {
      email: 'user@example.com',
      provider: 'Gmail',
      errorCode: 'SMTP_AUTH_FAILED',
    });

    // 🔴 Fatal: Erros críticos
    this.logger.fatal('Banco de dados não está disponível', {
      host: 'localhost',
      port: 5432,
    });
  }
}

/**
 * 📊 OUTPUT EM DESENVOLVIMENTO (pino-pretty + colorize)
 * 
 * [14:30:45.123] INFO (MyUseCase): Operação iniciada
 *   userId: "user-123"
 *   action: "login"
 * 
 * [14:30:46.456] DEBUG (MyUseCase): Dados do usuário recuperados
 *   email: "user@example.com"
 *   role: "admin"
 * 
 * [14:30:47.789] WARN (MyUseCase): Tentativa de acesso com senha incorreta
 *   userId: "user-123"
 *   attempts: 3
 */

/**
 * 📊 OUTPUT EM PRODUCTION (JSON estruturado)
 * 
 * {"level":30,"time":"2026-01-18T14:30:45.123Z","userId":"user-123","action":"login","msg":"Operação iniciada"}
 * {"level":20,"time":"2026-01-18T14:30:46.456Z","email":"user@example.com","role":"admin","msg":"Dados do usuário recuperados"}
 * {"level":40,"time":"2026-01-18T14:30:47.789Z","userId":"user-123","attempts":3,"msg":"Tentativa de acesso com senha incorreta"}
 */

/**
 * 📝 LOG LEVELS (em ordem de severidade)
 * 
 * - TRACE (10): Super detalhado (não ativado por padrão)
 * - DEBUG (20): Informações detalhadas para debugging
 * - INFO (30): Informações gerais [DEFAULT]
 * - WARN (40): Avisos
 * - ERROR (50): Erros
 * - FATAL (60): Erros críticos
 * 
 * Use LOG_LEVEL no .env para controlar qual nível visualizar
 * Ex: LOG_LEVEL=debug (mostra debug, info, warn, error, fatal)
 *     LOG_LEVEL=warn  (mostra apenas warn, error, fatal)
 */

/**
 * 🔧 VARIÁVEIS .env
 * 
 * NODE_ENV=development    # development ou production
 * LOG_LEVEL=debug         # trace, debug, info, warn, error, fatal
 * 
 * Em desenvolvimento: Logs coloridos e legíveis (pino-pretty)
 * Em production: Logs em JSON (pode ser enviado para ELK, Datadog, etc)
 */
