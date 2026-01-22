import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { Customer } from '../../domain/entities';
import { UpdateCustomerDto } from '../../adapters/dtos';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { getTracer } from '../../../../../app/telemetry';

@Injectable()
export class UpdateCustomerUseCase {
  private readonly tracer = getTracer();

  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const span = this.tracer.startSpan('update_customer_process', {
      attributes: {
        'customer.id': id,
        'operation': 'UPDATE_CUSTOMER',
      },
    });

    try {
      const findSpan = this.tracer.startSpan('find_customer_by_id', { parent: span });
      const customer = await this.customerRepository.findById(id);
      findSpan.end();

      if (!customer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      const updateSpan = this.tracer.startSpan('update_customer_repository', { parent: span });
      const updated = await this.customerRepository.update(id, data);
      updateSpan.end();

      if (!updated) {
        throw new NotFoundException('Falha ao atualizar cliente');
      }

      const auditSpan = this.tracer.startSpan('audit_update_customer', { parent: span });
      try {
        await this.logAuditUseCase.execute({
          userId: customer.userId,
          userEmail: '',
          action: 'UPDATE',
          entityType: 'Customer',
          entityId: id,
          oldValues: customer,
          newValues: updated,
          ipAddress: '',
          userAgent: '',
          endpoint: '/api/customers/:id',
          httpMethod: 'PATCH',
          status: '200',
          errorMessage: null,
        });
      } catch (auditError: unknown) {
        const auditErrorMsg = auditError instanceof Error ? auditError.message : String(auditError);
      } finally {
        auditSpan.end();
      }

      span.setAttributes({
        'status': 200,
      });

      return updated;
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  }
}
