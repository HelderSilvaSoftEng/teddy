import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { typeormConfig } from './typeorm.config';
import { runAdminUserSeed } from './seeds/create-admin-user.seed';
import { runCustomersSeed } from './seeds/create-customers.seed';

@Module({
  imports: [TypeOrmModule.forRoot(typeormConfig)],
  exports: [TypeOrmModule],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      // Aguardar um pouco para garantir que TypeORM sincronizou o banco
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (this.dataSource.isInitialized) {
        await runAdminUserSeed(this.dataSource);
        await runCustomersSeed(this.dataSource);
      }
    } catch (error) {
      console.error('❌ Error running seeds:', error);
    }
  }
}
