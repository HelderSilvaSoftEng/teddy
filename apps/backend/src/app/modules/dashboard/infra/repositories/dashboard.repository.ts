import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/domain/entities/user.entity';
import { Customer } from '../../../customers/domain/entities/customer.entity';
import { AuditLog } from '../../../../../common/modules/audit/domain/entities/audit-log.entity';
import type { IDashboardRepositoryPort } from '../../domain/ports/dashboard.repository.port.ts';

@Injectable()
export class DashboardRepository implements IDashboardRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getTotalUsers(): Promise<number> {
    return await this.userRepository.count({
      where: { deletedAt: null },
    });
  }

  async getTotalCustomers(): Promise<number> {
    return await this.customerRepository.count({
      where: { deletedAt: null },
    });
  }

  async getTotalAuditLogs(): Promise<number> {
    return await this.auditLogRepository.count();
  }

  async getRecentUsers(limit: number): Promise<Array<{ id: string; email: string; name: string; createdAt: Date }>> {
    const users = await this.userRepository.find({
      where: { deletedAt: null },
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'email', 'name', 'createdAt'],
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }));
  }
}
