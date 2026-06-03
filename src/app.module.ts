import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { CasesModule } from './cases/cases.module';
import { DocumentsModule } from './documents/documents.module';
import { SessionsModule } from './sessions/sessions.module';
import { AiModule } from './ai/ai.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AssignmentModule } from './assignment/assignment.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { MemberProfileModule } from './member-profile/member-profile.module';
import { LawyersModule } from './lawyers/lawyers.module';
import { LegalAssociatesModule } from './legal-associates/legal-associates.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CourtDatesModule } from './court-dates/court-dates.module';
import { RealtimeModule } from './realtime/realtime.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TimelineModule } from './timeline/timeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CasesModule,
    DocumentsModule,
    SessionsModule,
    AiModule,
    WorkflowModule,
    AssignmentModule,
    NotificationsModule,
    UsersModule,
    AuditModule,
    MemberProfileModule,
    LawyersModule,
    LegalAssociatesModule,
    AppointmentsModule,
    CourtDatesModule,
    RealtimeModule,
    DashboardModule,
    TimelineModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
