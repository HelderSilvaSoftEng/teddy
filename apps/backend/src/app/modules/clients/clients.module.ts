import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './domain/entities/client.entity';
import { ClientRepository } from './infra/repositories/client.repository';
import { ClientMapper } from './infra/mappers/client.mapper';
import { ClientController } from './adapters/controllers/client.controller';
import { CLIENT_REPOSITORY_TOKEN } from './domain/ports/client.repository.port';
import {
  CreateClientUseCase,
  FindClientByIdUseCase,
  FindAllClientsUseCase,
  UpdateClientUseCase,
  DeleteClientUseCase,
  ChangePasswordUseCase,
} from './presentation/use-case';
import {
  CREATE_CLIENT_PORT,
  FIND_CLIENT_BY_ID_PORT,
  FIND_ALL_CLIENTS_PORT,
  UPDATE_CLIENT_PORT,
  DELETE_CLIENT_PORT,
  CHANGE_PASSWORD_PORT,
} from './presentation/ports';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientController],
  providers: [
    ClientMapper,
    CreateClientUseCase,
    FindClientByIdUseCase,
    FindAllClientsUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    ChangePasswordUseCase,
    {
      provide: CLIENT_REPOSITORY_TOKEN,
      useClass: ClientRepository,
    },
    {
      provide: CREATE_CLIENT_PORT,
      useClass: CreateClientUseCase,
    },
    {
      provide: FIND_CLIENT_BY_ID_PORT,
      useClass: FindClientByIdUseCase,
    },
    {
      provide: FIND_ALL_CLIENTS_PORT,
      useClass: FindAllClientsUseCase,
    },
    {
      provide: UPDATE_CLIENT_PORT,
      useClass: UpdateClientUseCase,
    },
    {
      provide: DELETE_CLIENT_PORT,
      useClass: DeleteClientUseCase,
    },
    {
      provide: CHANGE_PASSWORD_PORT,
      useClass: ChangePasswordUseCase,
    },
  ],
  exports: [
    ClientMapper,
    CLIENT_REPOSITORY_TOKEN,  // ← NOVO: Exportar para AuthenticationModule
  ],
})
export class ClientsModule {}


