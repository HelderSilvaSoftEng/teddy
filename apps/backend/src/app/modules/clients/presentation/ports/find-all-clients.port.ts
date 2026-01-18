import { Client } from '../../domain/entities/client.entity';

export const FIND_ALL_CLIENTS_PORT = Symbol('FIND_ALL_CLIENTS_PORT');

export interface IFindAllClientsPort {
  execute(skip: number, take: number): Promise<{ data: Client[]; total: number }>;
}
