import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './domain/entities';
import { AUDIT_REPOSITORY_TOKEN } from './domain/ports';
import { AuditRepository } from './infra/repositories';
import { AuditMapper } from './infra/mappers';
import { LogAuditUseCase } from './presentation/use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    {
      provide: AUDIT_REPOSITORY_TOKEN,
      useClass: AuditRepository,
    },
    AuditMapper,
    LogAuditUseCase,
    AuditRepository,
  ],
  exports: [AUDIT_REPOSITORY_TOKEN, AuditMapper, AuditRepository, LogAuditUseCase],
})
export class AuditModule {}
