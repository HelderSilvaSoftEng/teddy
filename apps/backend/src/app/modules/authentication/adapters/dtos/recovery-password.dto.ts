import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecoveryPasswordDto {
  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário para recuperação de senha',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;
}
