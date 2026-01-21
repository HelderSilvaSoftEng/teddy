import { Injectable, Logger, Inject } from '@nestjs/common';
import { AuditLog } from '../../domain/entities';
import type { IAuditRepositoryPort } from '../../domain/ports';
import { AUDIT_REPOSITORY_TOKEN } from '../../domain/ports';
import { CreateAuditLogDto } from '../../adapters/dtos';

@Injectable()
export class LogAuditUseCase {
  private readonly logger = new Logger(LogAuditUseCase.name);

  constructor(
    @Inject(AUDIT_REPOSITORY_TOKEN)
    private readonly auditRepository: IAuditRepositoryPort,
  ) {}

  async execute(dto: CreateAuditLogDto): Promise<AuditLog> {
    this.logger.debug(
      `📝 Registrando auditoria: ${dto.entityType}.${dto.action} para usuário ${dto.userId}`,
    );

    const auditLog = await this.auditRepository.create({
      userId: dto.userId,
      userEmail: dto.userEmail,
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId,
      oldValues: dto.oldValues || null,
      newValues: dto.newValues || null,
      changes: dto.changes || null,
      ipAddress: dto.ipAddress || null,
      userAgent: dto.userAgent || null,
      endpoint: dto.endpoint || null,
      httpMethod: dto.httpMethod || null,
      status: dto.status || null,
      errorMessage: dto.errorMessage || null,
    });

    this.logger.debug(`✅ Auditoria registrada: ${auditLog.id}`);
    return auditLog;
  }
}
