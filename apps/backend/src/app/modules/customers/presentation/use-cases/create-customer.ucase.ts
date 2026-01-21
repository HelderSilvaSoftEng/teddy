import { Injectable, Inject } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { Customer } from '../../domain/entities';
import { CreateCustomerDto } from '../../adapters/dtos';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { getTracer } from '../../../../../app/telemetry';

@Injectable()
export class CreateCustomerUseCase {
  private readonly tracer = getTracer();

  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(userId: string, data: CreateCustomerDto): Promise<Customer> {
    const span = this.tracer.startSpan('create_customer_process', {
      attributes: {
        'user.id': userId,
        'operation': 'CREATE_CUSTOMER',
      },
    });

    try {
      const createSpan = this.tracer.startSpan('create_customer_repository', { parent: span });
      const customer = await this.customerRepository.create({
        userId,
        ...data,
      });
      createSpan.end();

      const auditSpan = this.tracer.startSpan('audit_create_customer', { parent: span });
      try {
        await this.logAuditUseCase.execute({
          userId: customer.userId,
          userEmail: '',
          action: 'CREATE',
          entityType: 'Customer',
          entityId: customer.id,
          oldValues: null,
          newValues: customer,
          ipAddress: '',
          userAgent: '',
          endpoint: '/api/customers',
          httpMethod: 'POST',
          status: '201',
          errorMessage: null,
        });
      } catch {
        // Silently fail to not break main operation
      } finally {
        auditSpan.end();
      }

      span.setAttributes({
        'customer.id': customer.id,
        'status': 201,
      });

      return customer;
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  }
}
