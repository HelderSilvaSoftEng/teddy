import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './domain/entities';
import { CustomerRepository } from './infra/repositories';
import { CustomerMapper } from './infra/mappers';
import {
  CreateCustomerUseCase,
  FindCustomerByIdUseCase,
  FindCustomerByUserIdUseCase,
  FindAllCustomersUseCase,
  UpdateCustomerUseCase,
  DeleteCustomerUseCase,
} from './presentation/use-cases';
import { CUSTOMER_REPOSITORY_TOKEN } from './domain/ports';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
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
