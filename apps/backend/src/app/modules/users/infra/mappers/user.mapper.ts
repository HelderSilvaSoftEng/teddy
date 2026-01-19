import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserResponseDto, UserDetailDto } from '../../adapters/dtos/user-response.dto';

@Injectable()
export class UserMapper {
  toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      accessCount: user.accessCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toDetailDto(user: User): UserDetailDto {
    return {
      ...this.toResponseDto(user),
      refreshTokenHash: user.refreshTokenHash,
      refreshTokenExpires: user.refreshTokenExpires,
    };
  }

  toResponseDtoList(users: User[]): UserResponseDto[] {
    return users.map(user => this.toResponseDto(user));
  }
}

