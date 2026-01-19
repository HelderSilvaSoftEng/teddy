'use strict';

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../../app/modules/users/domain/entities/user.entity';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'teddy_db',
  entities: [User],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  subscribers: [],
  synchronize: false,
  logging: !isProduction,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
