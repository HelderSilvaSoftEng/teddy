import { Injectable } from '@nestjs/common';
import { Customer } from '../../domain/entities';
import { CustomerResponseDto } from '../../adapters/dtos';

@Injectable()
export class CustomerMapper {
  toResponseDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      userId: customer.userId,
      userName: customer.userName,
      personalId: customer.personalId,
      mobile: customer.mobile,
      salary: customer.salary,
      enterprise: customer.enterprise,
      status: customer.status,
      accessCount: customer.accessCount,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  toResponseDtoList(customers: Customer[]): CustomerResponseDto[] {
    return customers.map((customer) => this.toResponseDto(customer));
  }
}
