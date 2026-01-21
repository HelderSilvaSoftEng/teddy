import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED', 'SELECTED'],
    example: 'ACTIVE',
    description: 'Status do cliente',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;
}

