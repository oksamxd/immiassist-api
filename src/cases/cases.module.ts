import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { PrismaService } from '../prisma.service';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  controllers: [CasesController],
  providers: [CasesService, PrismaService],
  exports: [CasesService],
})
export class CasesModule {}
