import { Injectable } from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { ClientResponseDto, ClientDetailDto } from '../../adapters/dtos/client-response.dto';

@Injectable()
export class ClientMapper {
  toResponseDto(client: Client): ClientResponseDto {
    return {
      id: client.id,
      userName: client.userName,
      email: client.email,
      personalId: client.personalId,
      mobile: client.mobile,
      status: client.status,
      accessCount: client.accessCount,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  toDetailDto(client: Client): ClientDetailDto {
    return {
      ...this.toResponseDto(client),
      refreshTokenHash: client.refreshTokenHash,
      refreshTokenExpires: client.refreshTokenExpires,
    };
  }

  toResponseDtoList(clients: Client[]): ClientResponseDto[] {
    return clients.map(client => this.toResponseDto(client));
  }
}

