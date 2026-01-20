import { IAuthRepository, IRecoveryPasswordRequest, IRecoveryPasswordResponse } from '../../../domain';

export class RecoveryPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(request: IRecoveryPasswordRequest): Promise<IRecoveryPasswordResponse> {
    return this.authRepository.recoveryPassword(request);
  }
}
