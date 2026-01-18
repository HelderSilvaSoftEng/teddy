import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { Client } from '../../app/modules/clients/domain/entities/client.entity';

dotenv.config();

const logger = new Logger('TypeOrmConfig');

// Detectar o diretório raiz do projeto
const appDir = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../../../apps/backend/dist') 
  : path.join(__dirname, '../../../apps/backend/src');

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'teddy_db',
  entities: [Client],
  migrations: [path.join(appDir, 'migrations/*{.ts,.js}')],
  synchronize: process.env.NODE_ENV !== 'production',
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
  entitiesPath: appDir,
})}`);

export default typeormConfig;
