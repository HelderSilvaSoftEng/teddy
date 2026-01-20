import { IAuthRepository } from '../../../domain';

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
