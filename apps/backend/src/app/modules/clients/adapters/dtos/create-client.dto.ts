import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'joao.silva' })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Senha@Segura123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: '12345678901', required: false })
  @IsOptional()
  @IsString()
  personalId?: string;

  @ApiProperty({ example: '+55 (11) 98765-4321', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;
}
