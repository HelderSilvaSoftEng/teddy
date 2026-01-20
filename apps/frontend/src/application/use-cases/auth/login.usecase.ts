import { IAuthRepository, ILoginRequest, ITokenResponse } from '../../../domain';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(request: ILoginRequest): Promise<ITokenResponse> {
    return this.authRepository.login(request);
  }
}
