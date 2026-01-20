import { IAuthRepository, ICurrentUser } from '../../../domain';

export class GetCurrentUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<ICurrentUser> {
    return this.authRepository.getCurrentUser();
  }
}
