import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { PrismaService } from '../prisma.service';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule, RealtimeModule],
  controllers: [CasesController],
  providers: [CasesService, PrismaService],
  exports: [CasesService],
})
export class CasesModule {}
