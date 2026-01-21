import { Controller, Get, UseGuards, Query, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../authentication/infra/decorators/current-user.decorator';
import type { ICurrentUser } from '../../../authentication/domain/types';
import { GetDashboardStatsUseCase } from '../../presentation/use-cases/get-dashboard-stats.ucase';
import { GetRecentCustomersUseCase } from '../../presentation/use-cases/get-recent-users.ucase';
import { GetCustomerTrendByMonthUseCase } from '../../presentation/use-cases/get-customer-trend-by-month.ucase';
import { GetCustomerTrendByDayUseCase } from '../../presentation/use-cases/get-customer-trend-by-day.ucase';
import { DashboardStatsResponseDto } from '../dtos/dashboard-stats.response.dto';
import { RecentCustomerResponseDto } from '../dtos/recent-user.response.dto';
import type { CustomerTrendDataDto } from '../dtos/customer-trend.response.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getRecentCustomersUseCase: GetRecentCustomersUseCase,
    private readonly getCustomerTrendByMonthUseCase: GetCustomerTrendByMonthUseCase,
    private readonly getCustomerTrendByDayUseCase: GetCustomerTrendByDayUseCase,
  ) {}

  @Get('stats')
  async getStats(@CurrentUser() user: ICurrentUser): Promise<DashboardStatsResponseDto> {
    this.logger.log(`[DashboardController] GET /api/dashboard/stats - usuário: ${user.id}`);
    return await this.getDashboardStatsUseCase.execute(user);
  }

  @Get('recent-customers')
  async getRecentCustomers(
    @CurrentUser() user: ICurrentUser,
    @Query('limit') limit?: string,
  ): Promise<RecentCustomerResponseDto[]> {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 20) : 5;
    this.logger.log(`[DashboardController] GET /api/dashboard/recent-customers (limit: ${parsedLimit}) - usuário: ${user.id}`);
    return await this.getRecentCustomersUseCase.execute(user, parsedLimit);
  }

  @Get('customer-trend/month')
  async getCustomerTrendByMonth(
    @CurrentUser() user: ICurrentUser,
    @Query('months') months?: string,
  ): Promise<CustomerTrendDataDto[]> {
    const parsedMonths = months ? Math.min(parseInt(months, 10), 24) : 12;
    this.logger.log(`[DashboardController] GET /api/dashboard/customer-trend/month (months: ${parsedMonths}) - usuário: ${user.id}`);
    return await this.getCustomerTrendByMonthUseCase.execute(user, parsedMonths);
  }

  @Get('customer-trend/day')
  async getCustomerTrendByDay(
    @CurrentUser() user: ICurrentUser,
    @Query('days') days?: string,
  ): Promise<CustomerTrendDataDto[]> {
    const parsedDays = days ? Math.min(parseInt(days, 10), 365) : 30;
    this.logger.log(`[DashboardController] GET /api/dashboard/customer-trend/day (days: ${parsedDays}) - usuário: ${user.id}`);
    return await this.getCustomerTrendByDayUseCase.execute(user, parsedDays);
  }
}
