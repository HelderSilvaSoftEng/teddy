import { ApiProperty } from '@nestjs/swagger';

export class RecoveryPasswordResponseDto {
  @ApiProperty({
    example: 'Email enviado com sucesso. Verifique sua caixa de entrada.',
    description: 'Mensagem de confirmação',
  })
  message: string;
}
