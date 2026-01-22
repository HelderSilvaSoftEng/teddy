import type { IUser, ICreateUserRequest, IUpdateUserRequest, IUsersListResponse, IChangePasswordRequest } from '../../domain/users/user.types';

const API_BASE_URL = 'http://localhost:3000/api/v1/users';

function getAuthToken(): string {
  const token = 
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');
  return token || '';
}

export const userService = {
  async listUsers(skip = 0, take = 10): Promise<IUsersListResponse> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const response = await fetch(`${API_BASE_URL}?skip=${skip}&take=${take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuários: ${response.statusText}`);
    }

    return await response.json();
  },

  async getUserById(id: string): Promise<IUser> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuário: ${response.statusText}`);
    }

    return await response.json();
  },

  async createUser(data: ICreateUserRequest): Promise<IUser> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `Erro ao criar usuário: ${response.statusText}`);
    }

    return await response.json();
  },

  async updateUser(id: string, data: IUpdateUserRequest): Promise<IUser> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `Erro ao atualizar usuário: ${response.statusText}`);
    }

    return await response.json();
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar usuário: ${response.statusText}`);
    }

    return await response.json();
  },

  async changePassword(id: string, data: IChangePasswordRequest): Promise<{ message: string }> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const response = await fetch(`${API_BASE_URL}/${id}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `Erro ao alterar senha: ${response.statusText}`);
    }

    return await response.json();
  },
};
