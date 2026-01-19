import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  personalId?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsOptional()
  salary?: number;

  @IsString()
  @IsOptional()
  enterprise?: string;
}
