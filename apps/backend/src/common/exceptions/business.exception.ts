/**
 * Exceção base para erros de negócio
 * Estende a classe Error padrão do JavaScript
 */
export class BusinessException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 400,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'BusinessException';
    Object.setPrototypeOf(this, BusinessException.prototype);
  }
}

/**
 * Exceção para recursos não encontrados
 */
export class NotFoundException extends BusinessException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundException';
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

/**
 * Exceção para conflitos (ex: email duplicado)
 */
export class ConflictException extends BusinessException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictException';
    Object.setPrototypeOf(this, ConflictException.prototype);
  }
}

/**
 * Exceção para erros de validação
 */
export class ValidationException extends BusinessException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationException';
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}

/**
 * Exceção para acesso não autorizado
 */
export class UnauthorizedException extends BusinessException {
  constructor(message = 'Não autorizado', details?: Record<string, any>) {
    super(message, 'UNAUTHORIZED', 401, details);
    this.name = 'UnauthorizedException';
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

/**
 * Exceção para acesso proibido (autenticado mas sem permissão)
 */
export class ForbiddenException extends BusinessException {
  constructor(message = 'Acesso proibido', details?: Record<string, any>) {
    super(message, 'FORBIDDEN', 403, details);
    this.name = 'ForbiddenException';
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}

/**
 * Exceção para erro interno do servidor
 */
export class InternalServerException extends BusinessException {
  constructor(message = 'Erro interno do servidor', details?: Record<string, any>) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details);
    this.name = 'InternalServerException';
    Object.setPrototypeOf(this, InternalServerException.prototype);
  }
}

/**
 * Exceção para bad request
 */
export class BadRequestException extends BusinessException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'BAD_REQUEST', 400, details);
    this.name = 'BadRequestException';
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}
