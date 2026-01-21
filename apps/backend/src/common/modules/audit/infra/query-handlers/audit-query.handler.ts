import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../domain/entities';
import { IAuditQueryPort } from '../../domain/ports/audit-query.port';

@Injectable()
export class AuditQueryHandler implements IAuditQueryPort {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getTotalCount(): Promise<number> {
    return this.auditLogRepository.count();
  }

  async getRecentAuditLogs(limit: number): Promise<Array<{
    id: string;
    context: string;
    action: string;
    createdAt: Date;
  }>> {
    const logs = await this.auditLogRepository
      .find({
        select: ['id', 'context', 'action', 'createdAt'],
        order: { createdAt: 'DESC' },
        take: limit,
      });

    return logs;
  }
}
