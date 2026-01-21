import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AuditLog } from '../../domain/entities';
import { IAuditRepositoryPort } from '../../domain/ports';

@Injectable()
export class AuditRepository implements IAuditRepositoryPort {
  private readonly logger = new Logger(AuditRepository.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async create(
    data: Omit<AuditLog, 'id' | 'createdAt' | 'deletedAt'>,
  ): Promise<AuditLog> {
    try {
      const auditLog = this.repository.create(data);
      return await this.repository.save(auditLog);
    } catch (error) {
      this.logger.error(`Erro ao criar log de auditoria: ${error}`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<AuditLog | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByEntityId(entityId: string): Promise<AuditLog[]> {
    return await this.repository.find({
      where: { entityId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(
    userId: string,
    skip = 0,
    take = 20,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { userId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return { data, total };
  }

  async findAll(
    skip = 0,
    take = 20,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return { data, total };
  }
}
