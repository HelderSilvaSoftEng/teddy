import { Injectable, Inject } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { Customer } from '../../domain/entities';
import { CreateCustomerDto } from '../../adapters/dtos';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(userId: string, data: CreateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.create({
      userId,
      ...data,
    });

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
    }

    return customer;
  }
}
