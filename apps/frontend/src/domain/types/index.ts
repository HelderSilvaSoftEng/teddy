// Tipos de autenticação
export interface ICurrentUser {
  id: string;
  email: string;
  name?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ITokenResponse {
  accessToken: string;
  user: ICurrentUser;
}

export interface IRecoveryPasswordRequest {
  email: string;
}

export interface IRecoveryPasswordResponse {
  message: string;
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IResetPasswordResponse {
  message: string;
}

// Tipos de paginação
export interface IPaginationParams {
  skip?: number;
  take?: number;
  search?: string;
  searchField?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
}
