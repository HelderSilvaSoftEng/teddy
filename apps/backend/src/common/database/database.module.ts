import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { typeormConfig } from './typeorm.config';
import { runAdminUserSeed } from './seeds/create-admin-user.seed';
import { runCustomersSeed } from './seeds/create-customers.seed';

const logger = new Logger('DatabaseModule');

@Module({
  imports: [TypeOrmModule.forRoot(typeormConfig)],
  exports: [TypeOrmModule],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {
    logger.debug('DatabaseModule constructor called');
  }

  async onModuleInit() {
    try {
      logger.debug('onModuleInit started');
      
      // Aguardar um pouco para garantir que TypeORM sincronizou o banco
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logger.debug(`DataSource initialized: ${this.dataSource.isInitialized}`);
      
      if (this.dataSource.isInitialized) {
        logger.debug('Running seeds...');
        await runAdminUserSeed(this.dataSource);
        logger.debug('Admin seed completed');
        
        await runCustomersSeed(this.dataSource);
        logger.debug('Customers seed completed');
      } else {
        logger.warn('DataSource not initialized, skipping seeds');
      }
    } catch (error) {
      logger.error('❌ Error running seeds:', error);
      throw error;
    }
  }
}

