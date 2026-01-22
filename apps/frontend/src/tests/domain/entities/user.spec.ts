import { describe, it, expect } from 'vitest';
import { User } from '../../../domain/entities/user';

describe('User Entity', () => {
  it('should create a user with default values', () => {
    const user = new User();

    expect(user.id).toBeUndefined();
    expect(user.email).toBeUndefined();
    expect(user.name).toBeUndefined();
  });

  it('should create a user with provided data', () => {
    const userData = {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe',
    };

    const user = new User(userData);

    expect(user.id).toBe('123');
    expect(user.email).toBe('user@example.com');
    expect(user.name).toBe('John Doe');
  });

  it('should allow partial data in constructor', () => {
    const user = new User({
      id: '456',
      email: 'partial@example.com',
    });

    expect(user.id).toBe('456');
    expect(user.email).toBe('partial@example.com');
    expect(user.name).toBeUndefined();
  });

  it('should handle email validation format', () => {
    const user = new User({
      id: '789',
      email: 'test.user+tag@example.co.uk',
      name: 'Test User',
    });

    expect(user.email).toBe('test.user+tag@example.co.uk');
  });

  it('should support empty name', () => {
    const user = new User({
      id: '123',
      email: 'nname@example.com',
      name: '',
    });

    expect(user.name).toBe('');
  });

  it('should merge partial updates', () => {
    const user = new User({
      id: '123',
      email: 'original@example.com',
      name: 'Original Name',
    });

    // Simulate update
    Object.assign(user, {
      name: 'Updated Name',
    });

    expect(user.name).toBe('Updated Name');
    expect(user.email).toBe('original@example.com'); // unchanged
    expect(user.id).toBe('123'); // unchanged
  });

  it('should handle special characters in name', () => {
    const user = new User({
      id: '123',
      email: 'user@example.com',
      name: "D'Artagnan Müller-Søren",
    });

    expect(user.name).toBe("D'Artagnan Müller-Søren");
  });
});
