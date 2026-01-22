import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import type { IUserQueryPort } from '../../domain/ports/user-query.port';

@Injectable()
export class UserQueryHandler implements IUserQueryPort {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getTotalCount(): Promise<number> {
    return await this.userRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  async getRecentUsers(limit: number): Promise<Array<{ id: string; email: string; createdAt: Date }>> {
    const users = await this.userRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'email', 'createdAt'],
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    }));
  }
}
