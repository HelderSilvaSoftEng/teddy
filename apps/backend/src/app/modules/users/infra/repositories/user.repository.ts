import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IUserRepositoryPort } from '../../domain/ports/user.repository.port';

@Injectable()
export class UserRepository implements IUserRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async findAll(skip = 0, take = 10): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`User with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }

  async findDeleted(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async incrementAccessCount(id: string): Promise<void> {
    await this.repository.createQueryBuilder()
      .update(User)
      .set({ accessCount: () => 'accessCount + 1' })
      .where('id = :id', { id })
      .execute();
  }
}

