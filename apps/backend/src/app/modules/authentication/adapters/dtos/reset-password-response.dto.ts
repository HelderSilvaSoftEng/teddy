import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    example: 'Senha alterada com sucesso. Você pode fazer login com sua nova senha.',
    description: 'Mensagem de sucesso',
  })
  message: string;
}
