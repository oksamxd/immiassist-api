import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.casesService.create(req.user.userId, dto);
  }

  @Get()
  findMyCases(@Request() req: any) {
    const { role, userId } = req.user;
    if (role === 'LAWYER') return this.casesService.findAllByLawyer(userId);
    if (role === 'LEGAL_ASSOCIATE') return this.casesService.findAllByAssociate(userId);
    if (role === 'ADMIN') return this.casesService.findAll();
    return this.casesService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.casesService.updateStatus(id, body.status, req.user.userId, body.remarks);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.casesService.update(id, dto, req.user.userId);
  }
}
