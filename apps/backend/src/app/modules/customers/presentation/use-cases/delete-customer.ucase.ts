import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { getTracer } from '../../../../../app/telemetry';

@Injectable()
export class DeleteCustomerUseCase {
  private readonly tracer = getTracer();

  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const span = this.tracer.startSpan('delete_customer_process', {
      attributes: {
        'customer.id': id,
        'operation': 'DELETE_CUSTOMER',
      },
    });

    try {
      const findSpan = this.tracer.startSpan('find_customer_by_id', { parent: span });
      const customer = await this.customerRepository.findById(id);
      findSpan.end();

      if (!customer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      const deleteSpan = this.tracer.startSpan('delete_customer_repository', { parent: span });
      await this.customerRepository.delete(id);
      deleteSpan.end();

      const auditSpan = this.tracer.startSpan('audit_delete_customer', { parent: span });
      try {
        await this.logAuditUseCase.execute({
          userId: customer.userId,
          userEmail: '',
          action: 'DELETE',
          entityType: 'Customer',
          entityId: id,
          oldValues: customer,
          newValues: null,
          ipAddress: '',
          userAgent: '',
          endpoint: '/api/customers/:id',
          httpMethod: 'DELETE',
          status: '204',
          errorMessage: null,
        });
      } catch {
        // Silently fail to not break main operation
      } finally {
        auditSpan.end();
      }

      span.setAttributes({
        'status': 204,
      });
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  }
}
