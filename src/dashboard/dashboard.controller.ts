import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Request() req: any) {
    const { role, userId } = req.user;
    if (role === 'LAWYER') return this.dashboardService.getLawyerDashboard(userId);
    if (role === 'LEGAL_ASSOCIATE') return this.dashboardService.getAssociateDashboard(userId);
    return this.dashboardService.getMemberDashboard(userId);
  }
}
