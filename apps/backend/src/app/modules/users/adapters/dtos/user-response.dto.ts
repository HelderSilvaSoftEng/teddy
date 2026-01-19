export class UserResponseDto {
  id!: string;
  email!: string;
  status!: string;
  accessCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class UserDetailDto extends UserResponseDto {
  refreshTokenHash?: string;
  refreshTokenExpires?: Date;
}
