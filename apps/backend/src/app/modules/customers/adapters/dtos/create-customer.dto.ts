import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do cliente',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 5000.50,
    description: 'Salário mensal do cliente',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salary?: number;

  @ApiProperty({
    example: 'Tech Solutions LTDA',
    description: 'Empresa onde trabalha',
    required: false,
  })
  @IsString()
  @IsOptional()
  company?: string;
}
