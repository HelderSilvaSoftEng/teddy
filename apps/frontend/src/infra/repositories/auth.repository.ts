import { ILoginRequest, ITokenResponse, IRecoveryPasswordRequest, IRecoveryPasswordResponse, IResetPasswordRequest, IResetPasswordResponse, ICurrentUser } from '../../domain/types/index';
import { httpClient, API_CONFIG } from '../http/http-client';
import { tokenStorage } from '../storage/token.storage';

export class AuthRepository implements IAuthRepository {
  async login(request: ILoginRequest): Promise<ITokenResponse> {
    const response = await httpClient.post<ITokenResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      request
    );
    
    if (response.accessToken) {
      tokenStorage.setAccessToken(response.accessToken);
    }
    
    return response;
  }

  async recoveryPassword(request: IRecoveryPasswordRequest): Promise<IRecoveryPasswordResponse> {
    return httpClient.post<IRecoveryPasswordResponse>(
      API_CONFIG.ENDPOINTS.AUTH.RECOVERY_PASSWORD,
      request
    );
  }

  async resetPassword(request: IResetPasswordRequest): Promise<IResetPasswordResponse> {
    return httpClient.post<IResetPasswordResponse>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        token: request.token,
        newPassword: request.newPassword,
      }
    );
  }

  async getCurrentUser(): Promise<ICurrentUser> {
    return httpClient.get<ICurrentUser>(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
    } finally {
      tokenStorage.clear();
    }
  }
}

export const authRepository = new AuthRepository();
