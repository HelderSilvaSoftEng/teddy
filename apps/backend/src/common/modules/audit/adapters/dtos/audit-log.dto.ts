import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'ID do usuário que realizou a ação' })
  userId!: string;

  @ApiProperty({ description: 'Email do usuário que realizou a ação' })
  userEmail!: string;

  @ApiProperty({ description: 'Ação realizada: CREATE, UPDATE, DELETE' })
  action!: string;

  @ApiProperty({ description: 'Tipo de entidade: Customer, User, etc' })
  entityType!: string;

  @ApiProperty({ description: 'ID da entidade auditada' })
  entityId!: string;

  @ApiPropertyOptional({ description: 'Valores anteriores (para UPDATE)' })
  oldValues?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Novos valores' })
  newValues?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Descrição das mudanças' })
  changes?: string | null;

  @ApiPropertyOptional({ description: 'Endereço IP da requisição' })
  ipAddress?: string | null;

  @ApiPropertyOptional({ description: 'User Agent da requisição' })
  userAgent?: string | null;

  @ApiPropertyOptional({ description: 'Endpoint chamado' })
  endpoint?: string | null;

  @ApiPropertyOptional({ description: 'Método HTTP' })
  httpMethod?: string | null;

  @ApiPropertyOptional({ description: 'Status da operação: SUCCESS, ERROR' })
  status?: string | null;

  @ApiPropertyOptional({ description: 'Mensagem de erro (se houver)' })
  errorMessage?: string | null;
}

export class AuditLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  userEmail!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  entityId!: string;

  @ApiPropertyOptional()
  oldValues: Record<string, any> | null = null;

  @ApiPropertyOptional()
  newValues: Record<string, any> | null = null;

  @ApiPropertyOptional()
  changes: string | null = null;

  @ApiPropertyOptional()
  ipAddress: string | null = null;

  @ApiPropertyOptional()
  userAgent: string | null = null;

  @ApiPropertyOptional()
  endpoint: string | null = null;

  @ApiPropertyOptional()
  httpMethod: string | null = null;

  @ApiPropertyOptional()
  status: string | null = null;

  @ApiPropertyOptional()
  errorMessage: string | null = null;

  @ApiProperty()
  createdAt!: Date;
}
