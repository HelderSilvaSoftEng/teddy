import { ICurrentUser, ILoginRequest, ITokenResponse, IRecoveryPasswordRequest, IRecoveryPasswordResponse, IResetPasswordRequest, IResetPasswordResponse } from '../types';

export interface IAuthRepository {
  login(request: ILoginRequest): Promise<ITokenResponse>;
  recoveryPassword(request: IRecoveryPasswordRequest): Promise<IRecoveryPasswordResponse>;
  resetPassword(request: IResetPasswordRequest): Promise<IResetPasswordResponse>;
  getCurrentUser(): Promise<ICurrentUser>;
  logout(): Promise<void>;
  incrementAccessCount(): Promise<void>;
}
