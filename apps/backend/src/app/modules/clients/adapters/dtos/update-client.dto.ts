import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiProperty({ example: 'joao.silva', required: false })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({ example: 'joao@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '12345678901', required: false })
  @IsOptional()
  @IsString()
  personalId?: string;

  @ApiProperty({ example: '+55 (11) 98765-4321', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;
}
