// Entidade Customer
export class Customer {
  id!: string;
  userId!: string;
  name?: string;
  personalId?: string;
  mobile?: string;
  salary?: number;
  company?: string;
  status = 'ACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  constructor(data: Partial<Customer> = {}) {
    Object.assign(this, data);
  }
}

export interface ICustomer {
  id: string;
  userId: string;
  name?: string;
  personalId?: string;
  mobile?: string;
  salary?: number;
  company?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
