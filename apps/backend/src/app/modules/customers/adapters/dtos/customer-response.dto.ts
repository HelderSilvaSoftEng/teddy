import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único do cliente (UUID)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID do usuário proprietário (UUID)',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do cliente',
    nullable: true,
  })
  name: string | null = null;

  @ApiProperty({
    example: 5000.50,
    description: 'Salário mensal do cliente',
    type: Number,
    nullable: true,
  })
  salary: number | null = null;

  @ApiProperty({
    example: 'Tech Solutions LTDA',
    description: 'Empresa onde trabalha',
    nullable: true,
  })
  company: string | null = null;

  @ApiProperty({
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'],
    example: 'ACTIVE',
    description: 'Status do cliente',
  })
  status = 'ACTIVE';

  @ApiProperty({
    example: '2026-01-19T18:46:29.783Z',
    description: 'Data de criação',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-19T18:46:29.783Z',
    description: 'Data da última atualização',
    format: 'date-time',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description: 'Data de exclusão (soft delete)',
    nullable: true,
    format: 'date-time',
  })
  deletedAt: Date | null = null;
}
