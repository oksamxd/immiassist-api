import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { CasesModule } from './cases/cases.module';
import { TravelModule } from './travel/travel.module';
import { DocumentsModule } from './documents/documents.module';
import { SessionsModule } from './sessions/sessions.module';
import { AiModule } from './ai/ai.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AssignmentModule } from './assignment/assignment.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CasesModule,
    TravelModule,
    DocumentsModule,
    SessionsModule,
    AiModule,
    WorkflowModule,
    AssignmentModule,
    NotificationsModule,
    UsersModule,
    AuditModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
