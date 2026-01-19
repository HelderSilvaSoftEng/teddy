import { User } from '../../domain/entities/user.entity';

export const FIND_USER_BY_ID_PORT = Symbol('FIND_USER_BY_ID_PORT');

export interface IFindUserByIdPort {
  execute(id: string): Promise<User>;
}
