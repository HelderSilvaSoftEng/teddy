export class CreateClientDto {
  userName?: string;
  email!: string;
  password!: string;
  personalId?: string;
  mobile?: string;
  status?: string;
  refreshTokenHash?: string;
  refreshTokenExpires?: Date;
}
