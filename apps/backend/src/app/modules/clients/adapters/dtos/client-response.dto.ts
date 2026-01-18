export class ClientResponseDto {
  id!: string;
  userName?: string;
  email!: string;
  personalId?: string;
  mobile?: string;
  status!: string;
  accessCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ClientDetailDto extends ClientResponseDto {
  refreshTokenHash?: string;
  refreshTokenExpires?: Date;
}
