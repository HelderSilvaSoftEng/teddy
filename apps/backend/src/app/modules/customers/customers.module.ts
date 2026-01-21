import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './domain/entities';
import { CustomerRepository } from './infra/repositories';
import { CustomerMapper } from './infra/mappers';
import { CustomerController } from './adapters/controllers/customer.controller';
import {
  CreateCustomerUseCase,
  FindCustomerByIdUseCase,
  FindCustomerByUserIdUseCase,
  FindAllCustomersUseCase,
  UpdateCustomerUseCase,
  DeleteCustomerUseCase,
} from './presentation/use-cases';
import { CUSTOMER_REPOSITORY_TOKEN } from './domain/ports';
import { AuditModule } from '../../../common/modules/audit';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AuditModule],
  controllers: [CustomerController],
  providers: [
    CustomerMapper,
    CreateCustomerUseCase,
    FindCustomerByIdUseCase,
    FindCustomerByUserIdUseCase,
    FindAllCustomersUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    {
      provide: CUSTOMER_REPOSITORY_TOKEN,
      useClass: CustomerRepository,
    },
  ],
  exports: [
    CUSTOMER_REPOSITORY_TOKEN,
    CustomerMapper,
    CreateCustomerUseCase,
    FindCustomerByIdUseCase,
    FindCustomerByUserIdUseCase,
    FindAllCustomersUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
  ],
})
export class CustomersModule {}
