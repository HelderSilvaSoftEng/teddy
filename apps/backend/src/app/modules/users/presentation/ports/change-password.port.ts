import type { User } from '../../domain/entities/user.entity';
import type { ChangePasswordDto } from '../../adapters/dtos/change-password.dto';

export const CHANGE_PASSWORD_PORT = Symbol('CHANGE_PASSWORD_PORT');

export interface IChangePasswordPort {
  execute(id: string, input: ChangePasswordDto): Promise<{ message: string }>;
}
