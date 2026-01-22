import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoutUseCase } from '../../../../application/use-cases/auth/logout.usecase';
import type { IAuthRepository } from '../../../../domain';

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;
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
    logoutUseCase = new LogoutUseCase(mockAuthRepository);
  });

  it('should successfully logout', async () => {
    vi.mocked(mockAuthRepository.logout).mockResolvedValueOnce(undefined);

    await logoutUseCase.execute();

    expect(mockAuthRepository.logout).toHaveBeenCalled();
    expect(mockAuthRepository.logout).toHaveBeenCalledTimes(1);
  });

  it('should handle logout errors', async () => {
    const error = new Error('Logout failed');
    vi.mocked(mockAuthRepository.logout).mockRejectedValueOnce(error);

    await expect(logoutUseCase.execute()).rejects.toThrow('Logout failed');
  });

  it('should clear user session', async () => {
    localStorage.setItem('accessToken', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ id: '123', email: 'test@example.com' }));

    vi.mocked(mockAuthRepository.logout).mockImplementationOnce(async () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    });

    await logoutUseCase.execute();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
