import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'João Silva' })
  user!: string;

  @ApiProperty({ example: 'joao@example.com' })
  email!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token - também é enviado em cookie httpOnly'
  })
  refreshToken!: string;

  @ApiProperty({ example: 12, description: 'Quantidade de acessos do usuário' })
  accessCount!: number;
}
