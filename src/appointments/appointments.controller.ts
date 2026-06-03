import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.appointmentsService.create(dto.caseId, dto.lawyerId, dto, req.user.userId);
  }

  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.appointmentsService.findByCase(caseId);
  }

  @Get('lawyer')
  findByLawyer(@Request() req: any) {
    return this.appointmentsService.findByLawyer(req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.appointmentsService.updateStatus(id, body.status, req.user.userId);
  }
}
