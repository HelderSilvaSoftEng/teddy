import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IUserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../domain/ports/user.repository.port';
import { User, UserStatusEnum } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../adapters/dtos/create-user.dto';
import { LogAuditUseCase } from '../../../../../common/modules/audit/presentation/use-cases';
import { getTracer } from '../../../../../app/telemetry';
import { ConflictException } from '../../../../../common/exceptions';

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
  private readonly tracer = getTracer();

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly UserRepository: IUserRepositoryPort,
    private readonly logAuditUseCase: LogAuditUseCase,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    const span = this.tracer.startSpan('create_user_process', {
      attributes: {
        'user.email': createUserDto.email,
        'operation': 'CREATE_USER',
      },
    });

    try {
      // 1️⃣ Validar email único
      const validateSpan = this.tracer.startSpan('validate_email_unique', { parent: span });
      const existingUser = await this.UserRepository.findByEmail(
        createUserDto.email,
      );
      validateSpan.end();

      if (existingUser) {
        throw new ConflictException('Email já cadastrado', {
          field: 'email',
          value: createUserDto.email,
        });
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
      const createSpan = this.tracer.startSpan('create_user_repository', { parent: span });
      const createdUser = await this.UserRepository.create(user);
      createSpan.end();

      this.logger.log(`✅ Usuário criado com sucesso: ${createdUser.id}`);

      const auditSpan = this.tracer.startSpan('audit_create_user', { parent: span });
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
      } finally {
        auditSpan.end();
      }

      span.setAttributes({
        'user.id': createdUser.id,
        'status': 201,
      });

      return createdUser;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro ao criar usuário: ${errorMessage}`);
      span.recordException(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    } finally {
      span.end();
    }
  }
}
