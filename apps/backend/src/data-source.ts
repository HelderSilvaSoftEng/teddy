import { DataSource } from 'typeorm';
import { User } from './app/modules/users/domain/entities/user.entity';
import { Customer } from './app/modules/customers/domain/entities/customer.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'teddy_db',
  entities: [User, Customer],
  migrations: [],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
