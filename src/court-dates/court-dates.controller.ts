import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CourtDatesService } from './court-dates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('court-dates')
@UseGuards(JwtAuthGuard)
export class CourtDatesController {
  constructor(private readonly courtDatesService: CourtDatesService) {}

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.courtDatesService.create(dto.caseId, dto.lawyerId, dto, req.user.userId || req.user.sub);
  }

  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.courtDatesService.findByCase(caseId);
  }

  @Get('lawyer')
  findByLawyer(@Request() req: any) {
    return this.courtDatesService.findByLawyer(req.user.userId || req.user.sub);
  }

  /**
   * Member: view all upcoming court dates across all their cases.
   */
  @Get('upcoming')
  findUpcoming(@Request() req: any) {
    return this.courtDatesService.findUpcomingByUser(req.user.sub || req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.courtDatesService.updateStatus(id, body.status, req.user.userId || req.user.sub, body.notes);
  }
}
