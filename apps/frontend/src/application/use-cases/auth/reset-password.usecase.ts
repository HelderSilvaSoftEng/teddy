import { IAuthRepository, IResetPasswordRequest, IResetPasswordResponse } from '../../../domain';

export class ResetPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(request: IResetPasswordRequest): Promise<IResetPasswordResponse> {
    return this.authRepository.resetPassword(request);
  }
}
