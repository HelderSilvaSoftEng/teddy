import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['userId'])
@Index(['entityType', 'entityId'])
@Index(['action'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  userEmail!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string; // CREATE, UPDATE, DELETE

  @Column({ type: 'varchar', length: 100 })
  entityType!: string; // 'Customer', 'User', etc

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any> | null = null;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any> | null = null;

  @Column({ type: 'text', nullable: true })
  changes: string | null = null; // Descrição das mudanças

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null = null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null = null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string | null = null; // Ex: POST /v1/customers

  @Column({ type: 'varchar', length: 10, nullable: true })
  httpMethod: string | null = null; // GET, POST, PUT, DELETE

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: string | null = null; // SUCCESS, ERROR

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null = null;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null = null;
}
