import { Client } from '../../domain/entities/client.entity';

export const FIND_CLIENT_BY_ID_PORT = Symbol('FIND_CLIENT_BY_ID_PORT');

export interface IFindClientByIdPort {
  execute(id: string): Promise<Client>;
}
