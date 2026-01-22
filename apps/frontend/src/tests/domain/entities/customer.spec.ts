import { describe, it, expect } from 'vitest';
import { Customer } from '../../../domain/entities/customer';

describe('Customer Entity', () => {
  it('should create a customer with default values', () => {
    const customer = new Customer();

    expect(customer.status).toBe('ACTIVE');
    expect(customer.id).toBeUndefined();
    expect(customer.userId).toBeUndefined();
  });

  it('should create a customer with provided data', () => {
    const customerData = {
      id: '123',
      userId: '456',
      name: 'Empresa ABC',
      salary: 50000,
      company: 'ABC Ltda',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-21'),
    };

    const customer = new Customer(customerData);

    expect(customer.id).toBe('123');
    expect(customer.userId).toBe('456');
    expect(customer.name).toBe('Empresa ABC');
    expect(customer.salary).toBe(50000);
    expect(customer.company).toBe('ABC Ltda');
    expect(customer.status).toBe('ACTIVE');
  });

  it('should allow partial data in constructor', () => {
    const customer = new Customer({
      id: '789',
      name: 'Another Company',
    });

    expect(customer.id).toBe('789');
    expect(customer.name).toBe('Another Company');
    expect(customer.status).toBe('ACTIVE');
    expect(customer.userId).toBeUndefined();
  });

  it('should support soft delete with deletedAt', () => {
    const deletedDate = new Date('2026-01-21');
    const customer = new Customer({
      id: '123',
      userId: '456',
      name: 'Deleted Company',
      deletedAt: deletedDate,
    });

    expect(customer.deletedAt).toEqual(deletedDate);
  });

  it('should handle null deletedAt for active records', () => {
    const customer = new Customer({
      id: '123',
      userId: '456',
      deletedAt: null,
    });

    expect(customer.deletedAt).toBeNull();
  });

  it('should support status changes', () => {
    const customer = new Customer({
      id: '123',
      userId: '456',
      status: 'INACTIVE',
    });

    expect(customer.status).toBe('INACTIVE');
  });

  it('should track creation and update timestamps', () => {
    const createdAt = new Date('2026-01-01');
    const updatedAt = new Date('2026-01-21');

    const customer = new Customer({
      id: '123',
      userId: '456',
      createdAt,
      updatedAt,
    });

    expect(customer.createdAt).toEqual(createdAt);
    expect(customer.updatedAt).toEqual(updatedAt);
  });

  it('should merge partial updates', () => {
    const customer = new Customer({
      id: '123',
      userId: '456',
      name: 'Original Name',
      salary: 50000,
    });

    // Simulate update
    Object.assign(customer, {
      name: 'Updated Name',
      updatedAt: new Date(),
    });

    expect(customer.name).toBe('Updated Name');
    expect(customer.salary).toBe(50000); // unchanged
    expect(customer.id).toBe('123'); // unchanged
  });
});
