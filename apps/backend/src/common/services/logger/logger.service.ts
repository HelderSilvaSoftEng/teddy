import { Injectable } from '@nestjs/common';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Custom Logger Service - Logs estruturados com formatação bonita
 * JSON em production, colorido em development
 */
@Injectable()
export class LoggerService {
  private formatTimestamp(): string {
    return new Date().toLocaleTimeString('pt-BR');
  }

  private isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Log de informação
   */
  info(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment()) {
      console.log(
        `${colors.blue}[${this.formatTimestamp()}]${colors.reset} ${colors.green}ℹ${colors.reset}  ${message}`,
        context || '',
      );
    } else {
      console.log(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message, ...context }));
    }
  }

  /**
   * Log de debug
   */
  debug(message: string, context?: Record<string, any>): void {
    if (process.env.LOG_LEVEL === 'debug') {
      if (this.isDevelopment()) {
        console.log(
          `${colors.blue}[${this.formatTimestamp()}]${colors.reset} ${colors.gray}⚙${colors.reset}  ${message}`,
          context || '',
        );
      } else {
        console.log(JSON.stringify({ level: 'debug', timestamp: new Date().toISOString(), message, ...context }));
      }
    }
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment()) {
      console.warn(
        `${colors.blue}[${this.formatTimestamp()}]${colors.reset} ${colors.yellow}⚠${colors.reset}  ${message}`,
        context || '',
      );
    } else {
      console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), message, ...context }));
    }
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error | Record<string, any>): void {
    let errorObj: Record<string, any> = {};

    if (error instanceof Error) {
      errorObj = {
        error: error.name,
        stack: error.stack,
      };
    } else if (error) {
      errorObj = error;
    }

    if (this.isDevelopment()) {
      console.error(
        `${colors.blue}[${this.formatTimestamp()}]${colors.reset} ${colors.red}✖${colors.reset}  ${message}`,
        errorObj || '',
      );
    } else {
      console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), message, ...errorObj }));
    }
  }

  /**
   * Log fatal
   */
  fatal(message: string, error?: Error | Record<string, any>): void {
    let errorObj: Record<string, any> = {};

    if (error instanceof Error) {
      errorObj = {
        error: error.name,
        stack: error.stack,
      };
    } else if (error) {
      errorObj = error;
    }

    if (this.isDevelopment()) {
      console.error(
        `${colors.blue}[${this.formatTimestamp()}]${colors.reset} ${colors.red}🔴${colors.reset} ${message}`,
        errorObj || '',
      );
    } else {
      console.error(JSON.stringify({ level: 'fatal', timestamp: new Date().toISOString(), message, ...errorObj }));
    }
  }

  /**
   * Retorna instância de logging (para compatibilidade)
   */
  getLogger(): this {
    return this;
  }
}
