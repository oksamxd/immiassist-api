import { Controller, Post, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('assignment')
@UseGuards(JwtAuthGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post('support/:caseId')
  assignSupport(@Req() req: any, @Param('caseId') caseId: string) {
    return this.assignmentService.assignSupport(caseId, req.user.sub);
  }

  @Post('lawyer/:caseId')
  alertLawyer(@Req() req: any, @Param('caseId') caseId: string) {
    return this.assignmentService.alertLawyer(caseId, req.user.sub);
  }

  @Patch('lawyer/:caseId/accept')
  lawyerAccept(@Req() req: any, @Param('caseId') caseId: string) {
    return this.assignmentService.lawyerAccept(caseId, req.user.sub);
  }
}
