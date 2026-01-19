import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CustomerStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string; // FK para User

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  personalId: string | null; // CPF

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salary: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  enterprise: string | null;

  @Column({ type: 'varchar', default: CustomerStatusEnum.ACTIVE })
  status: string;

  @Column({ type: 'integer', default: 0 })
  accessCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  constructor(data?: Partial<Customer>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Verifica se o cliente está ativo
   */
  isActive(): boolean {
    return this.status === CustomerStatusEnum.ACTIVE;
  }

  /**
   * Desativa o cliente
   */
  deactivate(): void {
    this.status = CustomerStatusEnum.INACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Ativa o cliente
   */
  activate(): void {
    this.status = CustomerStatusEnum.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Suspende o cliente
   */
  suspend(): void {
    this.status = CustomerStatusEnum.SUSPENDED;
    this.updatedAt = new Date();
  }

  /**
   * Incrementa contador de acessos
   */
  incrementAccessCount(): void {
    this.accessCount++;
    this.updatedAt = new Date();
  }

  /**
   * Atualiza dados do cliente
   */
  update(data: Partial<Customer>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
