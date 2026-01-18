import type { Client } from '../../domain/entities/client.entity';
import type { ChangePasswordDto } from '../../adapters/dtos/change-password.dto';

export const CHANGE_PASSWORD_PORT = Symbol('CHANGE_PASSWORD_PORT');

export interface IChangePasswordPort {
  execute(id: string, input: ChangePasswordDto): Promise<{ message: string }>;
}
