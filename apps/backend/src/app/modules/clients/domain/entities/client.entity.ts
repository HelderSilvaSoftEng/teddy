import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { createHash } from 'crypto';

export enum ClientStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  userName?: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string;

  @Column({ type: 'varchar', nullable: true })
  personalId?: string;

  @Column({ type: 'varchar', nullable: true })
  mobile?: string;

  @Column({ type: 'varchar', default: ClientStatusEnum.ACTIVE })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  accessCount!: number;

  constructor(data?: Partial<Client>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Verifica se o cliente está ativo
   */
  isActive(): boolean {
    return this.status === ClientStatusEnum.ACTIVE;
  }

  /**
   * Desativa o cliente
   */
  deactivate(): void {
    this.status = ClientStatusEnum.INACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Ativa o cliente
   */
  activate(): void {
    this.status = ClientStatusEnum.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Suspende o cliente
   */
  suspend(): void {
    this.status = ClientStatusEnum.SUSPENDED;
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
   * Atualiza dados do cliente
   */
  update(data: Partial<Client>): void {
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
    const hash = Client.hashPassword(plainPassword);
    return hash === this.password;
  }

  /**
   * Define uma nova senha (hasheada)
   * Lógica de domínio: atualizar a senha com segurança
   */
  setPassword(plainPassword: string): void {
    this.password = Client.hashPassword(plainPassword);
    this.updatedAt = new Date();
  }
}
