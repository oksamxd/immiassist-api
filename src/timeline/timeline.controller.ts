import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('timeline')
@UseGuards(JwtAuthGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get(':caseId')
  getTimeline(@Param('caseId') caseId: string) {
    return this.timelineService.getCaseTimeline(caseId);
  }
}
