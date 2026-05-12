import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseStatusDto } from './dto/case.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateCaseDto) {
    return this.casesService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.casesService.findAllByUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCaseStatusDto) {
    return this.casesService.updateStatus(id, dto.status, req.user.sub, dto.remarks);
  }
}
