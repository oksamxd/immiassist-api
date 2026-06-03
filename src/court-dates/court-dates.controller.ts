import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CourtDatesService } from './court-dates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('court-dates')
@UseGuards(JwtAuthGuard)
export class CourtDatesController {
  constructor(private readonly courtDatesService: CourtDatesService) {}

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.courtDatesService.create(dto.caseId, dto.lawyerId, dto, req.user.userId);
  }

  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.courtDatesService.findByCase(caseId);
  }

  @Get('lawyer')
  findByLawyer(@Request() req: any) {
    return this.courtDatesService.findByLawyer(req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.courtDatesService.updateStatus(id, body.status, req.user.userId, body.notes);
  }
}
