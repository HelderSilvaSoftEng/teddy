import { Client } from '../entities/client.entity';

export const CLIENT_REPOSITORY_TOKEN = Symbol('CLIENT_REPOSITORY_TOKEN');

export interface IClientRepositoryPort {
  create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Client>;
  
  findById(id: string): Promise<Client | null>;
  
  findByEmail(email: string): Promise<Client | null>;
  
  findAll(skip?: number, take?: number): Promise<{ data: Client[]; total: number }>;
  
  update(id: string, data: Partial<Client>): Promise<Client>;
  
  delete(id: string): Promise<void>; // Soft delete
  
  findDeleted(id: string): Promise<Client | null>;
  
  incrementAccessCount(id: string): Promise<void>;
}

