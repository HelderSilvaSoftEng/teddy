import { Injectable } from '@nestjs/common';
import { AuditLog } from '../../domain/entities';
import type { AuditLogResponseDto } from '../../adapters/dtos';

@Injectable()
export class AuditMapper {
  toResponseDto(auditLog: AuditLog): AuditLogResponseDto {
    return {
      id: auditLog.id,
      userId: auditLog.userId,
      userEmail: auditLog.userEmail,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      oldValues: auditLog.oldValues,
      newValues: auditLog.newValues,
      changes: auditLog.changes,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      endpoint: auditLog.endpoint,
      httpMethod: auditLog.httpMethod,
      status: auditLog.status,
      errorMessage: auditLog.errorMessage,
      createdAt: auditLog.createdAt,
    };
  }

  toResponseDtoList(auditLogs: AuditLog[]): AuditLogResponseDto[] {
    return auditLogs.map((auditLog) => this.toResponseDto(auditLog));
  }
}
