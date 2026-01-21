import { Injectable, BadRequestException, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import { User, UserStatusEnum } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../adapters/dtos/create-user.dto';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';

/**
 * CreateUserUseCase - Lógica para criar um novo usuário
 *
 * Fluxo:
 * 1. Validar email único
 * 2. Criar instância da entidade User
 * 3. Salvar no repositório
 * 4. Retornar usuário criado
 */
@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    try {
      // 1️⃣ Validar email único
      const existingUser = await this.UserRepository.findByEmail(
        createUserDto.email,
      );

      if (existingUser) {
        throw new BadRequestException('Email já cadastrado');
      }

      // 2️⃣ Criar instância da entidade com dados do DTO
      const user = new User({
        email: createUserDto.email,
        password: User.hashPassword(createUserDto.password),
        status: UserStatusEnum.ACTIVE,
        accessCount: 0,
      });

      this.logger.log(`📝 Criando usuário: ${user.email}`);

      // 3️⃣ Salvar no repositório
      const createdUser = await this.UserRepository.create(user);

      this.logger.log(`✅ Usuário criado com sucesso: ${createdUser.id}`);

      try {
        await this.logAuditUseCase.execute({
          userId: createdUser.id,
          userEmail: createdUser.email,
          action: 'CREATE',
          entityType: 'User',
          entityId: createdUser.id,
          oldValues: null,
          newValues: createdUser,
          ipAddress: '',
          userAgent: '',
          endpoint: '/api/v1/users',
          httpMethod: 'POST',
          status: '201',
          errorMessage: null,
        });
      } catch {
        // Silently fail to not break main operation
      }

      return createdUser;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao criar usuário: ${errorMessage}`);
      throw error;
    }
  }
}
