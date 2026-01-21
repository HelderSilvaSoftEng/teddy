import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './domain/entities';
import { CustomerRepository } from './infra/repositories';
import { CustomerQueryHandler } from './infra/query-handlers/customer-query.handler';
import { CustomerTrendQueryHandler } from './infra/query-handlers/customer-trend-query.handler';
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
import { CUSTOMER_REPOSITORY_TOKEN, CUSTOMER_QUERY_PORT } from './domain/ports';
import { CUSTOMER_TREND_QUERY_PORT } from './domain/ports/customer-trend-query.port';
import { AuditModule } from '../../../common/modules/audit';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AuditModule],
  controllers: [CustomerController],
  providers: [
    CustomerMapper,
    CustomerQueryHandler,
    CustomerTrendQueryHandler,
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
    {
      provide: CUSTOMER_QUERY_PORT,
      useClass: CustomerQueryHandler,
    },
    {
      provide: CUSTOMER_TREND_QUERY_PORT,
      useClass: CustomerTrendQueryHandler,
    },
  ],
  exports: [
    CUSTOMER_REPOSITORY_TOKEN,
    CUSTOMER_QUERY_PORT,
    CUSTOMER_TREND_QUERY_PORT,
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
