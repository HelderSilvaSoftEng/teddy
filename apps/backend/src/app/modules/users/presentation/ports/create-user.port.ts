import { CreateUserDto } from '../../adapters/dtos/create-user.dto';
import { User } from '../../domain/entities/user.entity';

export const CREATE_USER_PORT = Symbol('CREATE_USER_PORT');

export interface ICreateUserPort {
  execute(input: CreateUserDto): Promise<User>;
}
