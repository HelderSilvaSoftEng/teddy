export interface IUser {
  id: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
}

export interface IUpdateUserRequest {
  email?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IUsersListResponse {
  data: IUser[];
  total: number;
}
