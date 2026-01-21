import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { Customer } from '../../domain/entities';
import { UpdateCustomerDto } from '../../adapters/dtos';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    const updated = await this.customerRepository.update(id, data);
    if (!updated) {
      throw new NotFoundException('Falha ao atualizar cliente');
    }

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
    } catch {
      // Silently fail to not break main operation
    }

    return updated;
  }
}
