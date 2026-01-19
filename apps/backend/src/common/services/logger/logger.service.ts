import { ConsoleLogger, Injectable } from '@nestjs/common';
import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';
import pretty from 'pino-pretty';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private pinoLogger: PinoLogger;

  constructor(context?: string) {
    super(context || 'App');
    this.pinoLogger = this.createPinoLogger();
  }

  /**
   * Criar instância do Pino com configuração ambiente-específica
   */
  private createPinoLogger(): PinoLogger {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

    const options: LoggerOptions = {
      level: logLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
        bindings: () => ({}),
      },
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
          headers: req.headers,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
          headers: res.getHeaders?.(),
        }),
        err: pino.stdSerializers.err,
      },
    };

    // Em development: usar pino-pretty para formatação legível
    if (isDevelopment) {
      const prettyStream = pretty({
        colorize: true,
        singleLine: false,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid',
        customPrettifiers: {
          time: (inputData: string | object) => `🕐 ${inputData}`,
          level: (inputData: string | object) => {
            const level = String(inputData).toUpperCase();
            const levels: Record<string, string> = {
              'TRACE': '🔍 TRACE',
              'DEBUG': '🔧 DEBUG',
              'INFO': 'ℹ️  INFO',
              'WARN': '⚠️  WARN',
              'ERROR': '❌ ERROR',
              'FATAL': '🔴 FATAL',
            };
            return levels[level] || level;
          },
        },
      });

      return pino(options, prettyStream);
    }

    // Em production: JSON estruturado
    return pino(options);
  }

  /**
   * Override log() - INFO messages
   */
  override log(message: string, context?: string): void {
    this.pinoLogger.info(
      { 
        context: context || this.context,
      },
      message,
    );
  }

  /**
   * Override debug() - DEBUG messages
   */
  override debug(message: string, context?: string): void {
    this.pinoLogger.debug(
      { 
        context: context || this.context,
      },
      message,
    );
  }

  /**
   * Override warn() - WARN messages
   */
  override warn(message: string, context?: string): void {
    this.pinoLogger.warn(
      { 
        context: context || this.context,
      },
      message,
    );
  }

  /**
   * Override error() - ERROR messages
   */
  override error(message: string, trace?: string, context?: string): void {
    this.pinoLogger.error(
      { 
        context: context || this.context,
        trace,
      },
      message,
    );
  }

  /**
   * Override fatal() - FATAL messages
   */
  override fatal(message: string, trace?: string, context?: string): void {
    this.pinoLogger.fatal(
      { 
        context: context || this.context,
        trace,
      },
      message,
    );
  }

  /**
   * 📊 Log com métrica de performance
   */
  performance(message: string, durationMs: number, context?: Record<string, any>): void {
    const logLevel = durationMs > 1000 ? 'warn' : 'info';
    const icon = durationMs > 1000 ? '🐢' : '⚡';

    const perfContext = {
      duration_ms: durationMs,
      ...context,
    };

    if (logLevel === 'warn') {
      this.pinoLogger.warn(perfContext, `${icon} ${message}`);
    } else {
      this.pinoLogger.info(perfContext, `${icon} ${message}`);
    }
  }

  /**
   * 🚀 Log estruturado com rastreamento de requisição
   */
  httpRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    context?: Record<string, any>,
  ): void {
    const isError = statusCode >= 400;
    const icon = statusCode >= 500 ? '🔴' : statusCode >= 400 ? '⚠️' : '✅';

    const reqContext = {
      method,
      path,
      status: statusCode,
      duration_ms: durationMs,
      ...context,
    };

    if (isError) {
      this.pinoLogger.warn(reqContext, `${icon} HTTP ${method} ${path} → ${statusCode}`);
    } else {
      this.pinoLogger.info(reqContext, `${icon} HTTP ${method} ${path} → ${statusCode}`);
    }
  }

  /**
   * Acessar logger Pino diretamente se necessário
   */
  getPinoLogger(): PinoLogger {
    return this.pinoLogger;
  }
}
