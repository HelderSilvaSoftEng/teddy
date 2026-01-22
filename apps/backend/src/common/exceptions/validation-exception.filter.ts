import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse() as Record<string, any>;

    const validationErrors = exceptionResponse.message || [];
    const formattedErrors = this.formatValidationErrors(validationErrors);

    this.logger.warn(
      `📋 Validation Error: ${request.method} ${request.path}`,
      {
        errors: formattedErrors,
      },
    );

    response.status(400).json({
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      code: 'VALIDATION_ERROR',
      message: 'Erro de validação nos dados enviados',
      errors: formattedErrors,
    });
  }

  private formatValidationErrors(errors: any[]): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    if (Array.isArray(errors)) {
      errors.forEach((error) => {
        const property = error.property || 'unknown';
        const messages = error.constraints
          ? Object.values(error.constraints)
          : [error.message || 'Erro desconhecido'];

        formatted[property] = messages as string[];
      });
    }

    return formatted;
  }
}
