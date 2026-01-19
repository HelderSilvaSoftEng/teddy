import { Injectable } from '@nestjs/common';
import { Customer } from '../../domain/entities';
import { CustomerResponseDto } from '../../adapters/dtos';

@Injectable()
export class CustomerMapper {
  toResponseDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      userId: customer.userId,
      name: customer.name,
      personalId: (customer as any).personalId,
      mobile: (customer as any).mobile,
      salary: customer.salary,
      company: customer.company,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      deletedAt: customer.deletedAt,
    };
  }

  toResponseDtoList(customers: Customer[]): CustomerResponseDto[] {
    return customers.map((customer) => this.toResponseDto(customer));
  }
}
