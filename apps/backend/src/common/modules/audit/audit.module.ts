import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './domain/entities';
import { AUDIT_REPOSITORY_TOKEN, AUDIT_QUERY_PORT } from './domain/ports';
import { AuditRepository } from './infra/repositories';
import { AuditQueryHandler } from './infra/query-handlers/audit-query.handler';
import { AuditMapper } from './infra/mappers';
import { LogAuditUseCase } from './presentation/use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    {
      provide: AUDIT_REPOSITORY_TOKEN,
      useClass: AuditRepository,
    },
    {
      provide: AUDIT_QUERY_PORT,
      useClass: AuditQueryHandler,
    },
    AuditMapper,
    LogAuditUseCase,
    AuditRepository,
    AuditQueryHandler,
  ],
  exports: [AUDIT_REPOSITORY_TOKEN, AUDIT_QUERY_PORT, AuditMapper, AuditRepository, LogAuditUseCase],
})
export class AuditModule {}
