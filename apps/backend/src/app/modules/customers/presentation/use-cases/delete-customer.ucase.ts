import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    await this.customerRepository.delete(id);

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
    }
  }
}
