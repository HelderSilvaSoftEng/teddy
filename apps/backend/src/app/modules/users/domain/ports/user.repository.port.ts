import { User } from '../entities/user.entity';

export const USER_REPOSITORY_TOKEN = Symbol('USER_REPOSITORY_TOKEN');

export interface IUserRepositoryPort {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<User>;
  
  findById(id: string): Promise<User | null>;
  
  findByEmail(email: string): Promise<User | null>;
  
  findAll(skip?: number, take?: number): Promise<{ data: User[]; total: number }>;
  
  update(id: string, data: Partial<User>): Promise<User>;
  
  delete(id: string): Promise<void>; // Soft delete
  
  incrementAccessCount(id: string): Promise<void>;
}

