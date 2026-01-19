import { IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para reset de senha',
  })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token!: string;

  @ApiProperty({
    example: 'NovaSenh@123',
    description: 'Nova senha (mín. 8 caracteres, 1 maiúscula, 1 número)',
  })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter mínimo 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Senha deve conter pelo menos 1 letra maiúscula' })
  @Matches(/[0-9]/, { message: 'Senha deve conter pelo menos 1 número' })
  newPassword!: string;
}
