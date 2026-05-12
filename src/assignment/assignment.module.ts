import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../prisma.service';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, PrismaService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
