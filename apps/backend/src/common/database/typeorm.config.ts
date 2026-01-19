import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { User } from '../../app/modules/users/domain/entities';
import { Customer } from '../../app/modules/customers/domain/entities';

dotenv.config();

const logger = new Logger('TypeOrmConfig');

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'teddy_db',
  entities: [User, Customer],
  migrations: [],
  synchronize: true,
  migrationsRun: false,
  logging: process.env.DB_LOGGING === 'true',
  logger: 'advanced-console',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};

logger.debug(`Database Config: ${JSON.stringify({
  host: typeormConfig.host,
  port: typeormConfig.port,
  database: typeormConfig.database,
  synchronize: typeormConfig.synchronize,
})}`);

export default typeormConfig;
