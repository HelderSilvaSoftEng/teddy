import { IAuthRepository } from '../../../domain';

export class IncrementAccessCountUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.incrementAccessCount();
  }
}
