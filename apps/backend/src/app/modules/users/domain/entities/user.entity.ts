import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { createHash } from 'crypto';

export enum UserStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string;

  @Column({ type: 'varchar', default: UserStatusEnum.ACTIVE })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires?: Date;

  @Column({ type: 'varchar', nullable: true })
  recoveryTokenHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  recoveryTokenExpires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  accessCount!: number;

  constructor(data?: Partial<User>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Verifica se o cliente está ativo
   */
  isActive(): boolean {
    return this.status === UserStatusEnum.ACTIVE;
  }

  /**
   * Desativa o cliente
   */
  deactivate(): void {
    this.status = UserStatusEnum.INACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Ativa o cliente
   */
  activate(): void {
    this.status = UserStatusEnum.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Suspende o cliente
   */
  suspend(): void {
    this.status = UserStatusEnum.SUSPENDED;
    this.updatedAt = new Date();
  }

  /**
   * Atualiza token de refresh
   */
  updateRefreshToken(hash: string, expiresAt: Date): void {
    this.refreshTokenHash = hash;
    this.refreshTokenExpires = expiresAt;
    this.updatedAt = new Date();
  }

  /**
   * Valida se o token de refresh é válido
   */
  isRefreshTokenValid(): boolean {
    if (!this.refreshTokenHash || !this.refreshTokenExpires) {
      return false;
    }
    return new Date() < this.refreshTokenExpires;
  }

  /**
   * Incrementa contador de acessos
   */
  incrementAccessCount(): void {
    this.accessCount++;
    this.updatedAt = new Date();
  }

  /**
   * Limpa token de refresh (logout)
   */
  clearRefreshToken(): void {
    this.refreshTokenHash = undefined;
    this.refreshTokenExpires = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Atualiza dados do usuário
   */
  update(data: Partial<User>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Hash de senha usando SHA256
   * Lógica de domínio: transformar a senha em hash
   */
  static hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  /**
   * Valida se a senha fornecida é válida
   * Lógica de domínio: comparar senha com hash armazenado
   */
  isPasswordValid(plainPassword: string): boolean {
    const hash = User.hashPassword(plainPassword);
    return hash === this.password;
  }

  /**
   * Define uma nova senha (hasheada)
   * Lógica de domínio: atualizar a senha com segurança
   */
  setPassword(plainPassword: string): void {
    this.password = User.hashPassword(plainPassword);
    this.updatedAt = new Date();
  }
}
