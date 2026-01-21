import { AuditLog } from '../entities';

export interface IAuditRepositoryPort {
  create(
    data: Omit<AuditLog, 'id' | 'createdAt' | 'deletedAt'>,
  ): Promise<AuditLog>;

  findById(id: string): Promise<AuditLog | null>;

  findByEntityId(entityId: string): Promise<AuditLog[]>;

  findByUserId(
    userId: string,
    skip?: number,
    take?: number,
  ): Promise<{ data: AuditLog[]; total: number }>;

  findAll(
    skip?: number,
    take?: number,
  ): Promise<{ data: AuditLog[]; total: number }>;
}

export const AUDIT_REPOSITORY_TOKEN = Symbol('IAuditRepositoryPort');
