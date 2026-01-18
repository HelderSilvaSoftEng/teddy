import { CreateClientDto } from '../../adapters/dtos/create-client.dto';
import { Client } from '../../domain/entities/client.entity';

export const CREATE_CLIENT_PORT = Symbol('CREATE_CLIENT_PORT');

export interface ICreateClientPort {
  execute(input: CreateClientDto): Promise<Client>;
}
