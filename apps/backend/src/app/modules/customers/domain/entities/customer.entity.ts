import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CustomerStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('customers')
@Index(['userId'])
@Index(['status'])
@Index(['deletedAt']) 
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null = null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salary: number | null = null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string | null = null;

  @Column({ type: 'varchar', default: CustomerStatusEnum.ACTIVE })
  status: string = CustomerStatusEnum.ACTIVE;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null = null;

  constructor(data?: Partial<Customer>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
