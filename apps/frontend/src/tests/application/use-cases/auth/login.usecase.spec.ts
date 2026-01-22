import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../../../application/use-cases/auth/login.usecase';
import type { IAuthRepository, ILoginRequest, ITokenResponse } from '../../../../domain';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockAuthRepository: IAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      recoveryPassword: vi.fn(),
      resetPassword: vi.fn(),
      incrementAccessCount: vi.fn(),
    };
    loginUseCase = new LoginUseCase(mockAuthRepository);
  });

  it('should successfully login with valid credentials', async () => {
    const loginRequest: ILoginRequest = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    const expectedResponse: ITokenResponse = {
      accessToken: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(mockAuthRepository.login).mockResolvedValueOnce(expectedResponse);

    const result = await loginUseCase.execute(loginRequest);

    expect(result).toEqual(expectedResponse);
    expect(mockAuthRepository.login).toHaveBeenCalledWith(loginRequest);
    expect(mockAuthRepository.login).toHaveBeenCalledTimes(1);
  });

  it('should throw error with invalid credentials', async () => {
    const loginRequest: ILoginRequest = {
      email: 'test@example.com',
      password: 'WrongPassword123!',
    };

    const error = new Error('Invalid credentials');
    vi.mocked(mockAuthRepository.login).mockRejectedValueOnce(error);

    await expect(loginUseCase.execute(loginRequest)).rejects.toThrow('Invalid credentials');
    expect(mockAuthRepository.login).toHaveBeenCalledWith(loginRequest);
  });

  it('should throw error with non-existent user', async () => {
    const loginRequest: ILoginRequest = {
      email: 'nonexistent@example.com',
      password: 'Password123!',
    };

    const error = new Error('User not found');
    vi.mocked(mockAuthRepository.login).mockRejectedValueOnce(error);

    await expect(loginUseCase.execute(loginRequest)).rejects.toThrow('User not found');
  });

  it('should handle network errors', async () => {
    const loginRequest: ILoginRequest = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const error = new Error('Network error');
    vi.mocked(mockAuthRepository.login).mockRejectedValueOnce(error);

    await expect(loginUseCase.execute(loginRequest)).rejects.toThrow('Network error');
  });
});
