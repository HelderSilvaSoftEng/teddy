import { User } from '../../domain/entities/user.entity';

export const FIND_ALL_USERS_PORT = Symbol('FIND_ALL_USERS_PORT');

export interface IFindAllUsersPort {
  execute(skip: number, take: number): Promise<{ data: User[]; total: number }>;
}
