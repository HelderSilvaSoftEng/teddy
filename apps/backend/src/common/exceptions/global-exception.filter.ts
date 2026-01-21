import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from './business.exception';

/**
 * Formato padronizado de resposta de erro
 */
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Filtro global de exceções
 * Intercepta TODAS as exceções não tratadas da aplicação
 * Converte em respostas HTTP padronizadas
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Erro interno do servidor';
    let details: Record<string, any> | undefined;

    // 1️⃣ Exceção de negócio customizada
    if (exception instanceof BusinessException) {
      statusCode = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;

      this.logger.warn(
        `🎯 Business Exception: ${code} - ${message}`,
        {
          path: request.path,
          method: request.method,
          statusCode,
        },
      );
    }
    // 2️⃣ HttpException do NestJS
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as Record<string, any>;

      code = exceptionResponse.code || this.getCodeFromStatus(statusCode);
      message = exceptionResponse.message || exception.message;
      details = exceptionResponse.details;

      this.logger.warn(
        `⚠️ HTTP Exception: ${statusCode} - ${message}`,
        {
          path: request.path,
          method: request.method,
        },
      );
    }
    // 3️⃣ Erro genérico JavaScript
    else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_SERVER_ERROR';
      message = exception.message || 'Erro desconhecido';

      this.logger.error(
        `❌ Uncaught Error: ${exception.message}`,
        exception.stack,
        {
          path: request.path,
          method: request.method,
        },
      );
    }
    // 4️⃣ Erro desconhecido
    else {
      this.logger.error(
        `❌ Unknown Exception`,
        String(exception),
        {
          path: request.path,
          method: request.method,
        },
      );
    }

    // Construir resposta padronizada
    const errorResponse: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      code,
      message,
      ...(details && { details }),
    };

    response.status(statusCode).json(errorResponse);
  }

  /**
   * Mapear status HTTP para código de erro
   */
  private getCodeFromStatus(status: number): string {
    const statusCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };

    return statusCodeMap[status] || 'UNKNOWN_ERROR';
  }
}
