import { Controller, Get, UseGuards, Query, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import type { ICurrentUser } from '../../../authentication/domain/types';
import { GetDashboardStatsUseCase } from '../../presentation/use-cases/get-dashboard-stats.ucase';
import { GetRecentUsersUseCase } from '../../presentation/use-cases/get-recent-users.ucase';
import { DashboardStatsResponseDto } from '../dtos/dashboard-stats.response.dto';
import { RecentUserResponseDto } from '../dtos/recent-user.response.dto';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getRecentUsersUseCase: GetRecentUsersUseCase,
  ) {}

  @Get('stats')
  async getStats(@CurrentUser() user: ICurrentUser): Promise<DashboardStatsResponseDto> {
    this.logger.log(`[DashboardController] GET /api/dashboard/stats - usuário: ${user.id}`);
    return await this.getDashboardStatsUseCase.execute(user);
  }

  @Get('recent-users')
  async getRecentUsers(
    @CurrentUser() user: ICurrentUser,
    @Query('limit') limit?: string,
  ): Promise<RecentUserResponseDto[]> {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 20) : 5;
    this.logger.log(`[DashboardController] GET /api/dashboard/recent-users (limit: ${parsedLimit}) - usuário: ${user.id}`);
    return await this.getRecentUsersUseCase.execute(user, parsedLimit);
  }
}
