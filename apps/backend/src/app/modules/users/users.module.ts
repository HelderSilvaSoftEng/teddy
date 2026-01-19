import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './infra/repositories/user.repository';
import { UserMapper } from './infra/mappers/user.mapper';
import { UserController } from './adapters/controllers/user.controller';
import { USER_REPOSITORY_TOKEN } from './domain/ports/user.repository.port';
import {
  CreateUserUseCase,
  FindUserByIdUseCase,
  FindAllUsersUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  ChangePasswordUseCase,
} from './presentation/use-case';
import {
  CREATE_USER_PORT,
  FIND_USER_BY_ID_PORT,
  FIND_ALL_USERS_PORT,
  UPDATE_USER_PORT,
  DELETE_USER_PORT,
  CHANGE_PASSWORD_PORT,
} from './presentation/ports';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserMapper,
    CreateUserUseCase,
    FindUserByIdUseCase,
    FindAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ChangePasswordUseCase,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    {
      provide: CREATE_USER_PORT,
      useClass: CreateUserUseCase,
    },
    {
      provide: FIND_USER_BY_ID_PORT,
      useClass: FindUserByIdUseCase,
    },
    {
      provide: FIND_ALL_USERS_PORT,
      useClass: FindAllUsersUseCase,
    },
    {
      provide: UPDATE_USER_PORT,
      useClass: UpdateUserUseCase,
    },
    {
      provide: DELETE_USER_PORT,
      useClass: DeleteUserUseCase,
    },
    {
      provide: CHANGE_PASSWORD_PORT,
      useClass: ChangePasswordUseCase,
    },
  ],
  exports: [
    UserMapper,
    USER_REPOSITORY_TOKEN,  // Exportar para AuthenticationModule
  ],
})
export class UsersModule {}


