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
    example: '123.456.789-00',
    description: 'CPF do cliente',
    required: false,
  })
  @IsString()
  @IsOptional()
  personalId?: string;

  @ApiProperty({
    example: '+55 11 98765-4321',
    description: 'Telefone/Celular do cliente',
    required: false,
  })
  @IsString()
  @IsOptional()
  mobile?: string;

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
