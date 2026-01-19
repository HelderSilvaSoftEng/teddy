import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'SenhaAtual@123' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'NovaSenha@456' })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ example: 'NovaSenha@456' })
  @IsString()
  confirmPassword!: string;
}
