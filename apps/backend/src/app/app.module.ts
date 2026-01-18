import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [DatabaseModule, ClientsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
