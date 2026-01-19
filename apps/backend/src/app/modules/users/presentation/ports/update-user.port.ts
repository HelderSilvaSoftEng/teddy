import { UpdateUserDto } from '../../adapters/dtos/update-user.dto';
import { User } from '../../domain/entities/user.entity';

export const UPDATE_USER_PORT = Symbol('UPDATE_USER_PORT');

export interface IUpdateUserPort {
  execute(id: string, input: UpdateUserDto): Promise<User>;
}
