import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Client } from '../../domain/entities/client.entity';
import { IClientRepositoryPort } from '../../domain/ports/client.repository.port';

@Injectable()
export class ClientRepository implements IClientRepositoryPort {
  constructor(
    @InjectRepository(Client)
    private readonly repository: Repository<Client>,
  ) {}

  async create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Client> {
    const client = this.repository.create(data);
    return this.repository.save(client);
  }

  async findById(id: string): Promise<Client | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.repository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async findAll(skip = 0, take = 10): Promise<{ data: Client[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    await this.repository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Client with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }

  async findDeleted(id: string): Promise<Client | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async incrementAccessCount(id: string): Promise<void> {
    await this.repository.createQueryBuilder()
      .update(Client)
      .set({ accessCount: () => 'accessCount + 1' })
      .where('id = :id', { id })
      .execute();
  }
}

