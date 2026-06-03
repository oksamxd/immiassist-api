import { Module } from '@nestjs/common';
import { CourtDatesService } from './court-dates.service';
import { CourtDatesController } from './court-dates.controller';
import { PrismaService } from '../prisma.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [WorkflowModule, AuditModule],
  controllers: [CourtDatesController],
  providers: [CourtDatesService, PrismaService],
})
export class CourtDatesModule {}
