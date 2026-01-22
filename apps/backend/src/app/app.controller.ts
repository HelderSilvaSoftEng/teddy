import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators';

@ApiTags('🔗 Root')
@Controller()
export class AppController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'API Root - Health check' })
  getHello(): { message: string } {
    return { message: 'Hello API' };
  }
}
