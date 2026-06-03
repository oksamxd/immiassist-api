import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TravelService } from './travel.service';
import { CreateTravelPlanDto } from './dto/travel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('travel')
@UseGuards(JwtAuthGuard)
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTravelPlanDto) {
    return this.travelService.create(req.user.sub, dto);
  }

  @Get(':caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.travelService.findByCase(caseId);
  }

  @Post(':id/prep-pack')
  generatePrepPack(@Req() req: any, @Param('id') id: string) {
    return this.travelService.generatePrepPack(id, req.user.sub);
  }
}
