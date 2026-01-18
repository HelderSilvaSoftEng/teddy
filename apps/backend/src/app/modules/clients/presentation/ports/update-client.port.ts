import { UpdateClientDto } from '../../adapters/dtos/update-client.dto';
import { Client } from '../../domain/entities/client.entity';

export const UPDATE_CLIENT_PORT = Symbol('UPDATE_CLIENT_PORT');

export interface IUpdateClientPort {
  execute(id: string, input: UpdateClientDto): Promise<Client>;
}
