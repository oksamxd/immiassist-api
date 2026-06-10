import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SchedulingService implements OnModuleInit {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Runs immediately on startup to confirm scheduling is working.
   */
  onModuleInit() {
    this.logger.log('✅ SchedulingService initialized — AI-orchestrated scheduling active');
  }

  /**
   * Daily 8 AM: Send appointment reminders for consultations in the next 24 hours.
   */
  @Cron('0 8 * * *')
  async sendAppointmentReminders() {
    this.logger.log('⏰ [CRON] Running appointment reminder check...');
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = await this.prisma.appointment.findMany({
      where: {
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: now, lte: in24h },
      },
      include: {
        case: {
          include: {
            member: { select: { id: true, name: true, email: true } },
          },
        },
        lawyer: { include: { user: { select: { name: true } } } },
      },
    });

    this.logger.log(`  Found ${upcoming.length} upcoming appointment(s) in the next 24h`);

    for (const appt of upcoming) {
      const memberName = appt.case?.member?.name || 'Member';
      const lawyerName = appt.lawyer?.user?.name || 'your lawyer';
      const scheduledTime = new Date(appt.scheduledAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      });

      await this.notifications.create({
        userId: appt.case.userId,
        caseId: appt.caseId,
        type: 'APPOINTMENT_REMINDER',
        title: '⏰ Appointment Reminder',
        message: `Hi ${memberName}, reminder: your ${appt.appointmentType.toLowerCase().replace('_', ' ')} with ${lawyerName} is scheduled for ${scheduledTime} UTC.${appt.meetingLink ? ` Meeting link: ${appt.meetingLink}` : ''}`,
      });

      // Also notify the lawyer
      await this.notifications.create({
        userId: appt.lawyer.userId,
        caseId: appt.caseId,
        type: 'APPOINTMENT_REMINDER',
        title: '⏰ Upcoming Appointment',
        message: `Reminder: You have a ${appt.appointmentType.toLowerCase().replace('_', ' ')} scheduled for ${scheduledTime} UTC with case ${appt.case.caseNumber}.`,
      });

      this.logger.log(`  ✅ Reminder sent for appointment ${appt.id} (case ${appt.case.caseNumber})`);
    }
  }

  /**
   * Daily 9 AM: Send court date reminders for hearings within the next 7 days.
   */
  @Cron('0 9 * * *')
  async sendCourtDateReminders() {
    this.logger.log('⚖️ [CRON] Running court date reminder check...');
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming = await this.prisma.courtDate.findMany({
      where: {
        status: 'SCHEDULED',
        date: { gte: now, lte: in7days },
      },
      include: {
        case: {
          include: {
            member: { select: { id: true, name: true } },
          },
        },
        lawyer: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    this.logger.log(`  Found ${upcoming.length} court date(s) in the next 7 days`);

    for (const cd of upcoming) {
      const daysUntil = Math.ceil((cd.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const dateStr = cd.date.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' });

      // Notify member
      await this.notifications.create({
        userId: cd.case.userId,
        caseId: cd.caseId,
        type: 'COURT_DATE_REMINDER',
        title: '⚖️ Court Hearing Reminder',
        message: `Your court hearing is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} (${dateStr})${cd.location ? ` at ${cd.location}` : ''}. Please ensure you are prepared.`,
      });

      // Notify lawyer
      if (cd.lawyer?.user?.id) {
        await this.notifications.create({
          userId: cd.lawyer.user.id,
          caseId: cd.caseId,
          type: 'COURT_DATE_REMINDER',
          title: '⚖️ Court Hearing Reminder',
          message: `Court hearing for case ${cd.case.caseNumber} is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} (${dateStr})${cd.location ? ` at ${cd.location}` : ''}.`,
        });
      }

      this.logger.log(`  ✅ Court date reminder sent for case ${cd.case.caseNumber}`);
    }
  }

  /**
   * Every 4 hours: Nudge members with DOCUMENTS_PENDING or WAITING_FOR_DOCUMENTS cases.
   */
  @Cron('0 */4 * * *')
  async nudgePendingDocuments() {
    this.logger.log('📄 [CRON] Checking for cases with pending documents...');

    const pendingCases = await this.prisma.case.findMany({
      where: {
        status: { in: ['DOCUMENTS_PENDING', 'WAITING_FOR_DOCUMENTS'] },
        updatedAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // only if idle > 24h
      },
      include: {
        member: { select: { id: true, name: true } },
        documents: { select: { documentType: true, verificationStatus: true } },
      },
      take: 50,
    });

    this.logger.log(`  Found ${pendingCases.length} case(s) waiting for documents`);

    for (const c of pendingCases) {
      // Check existing unread notification to avoid spamming
      const recentNotif = await this.prisma.notification.findFirst({
        where: {
          userId: c.userId,
          caseId: c.id,
          type: 'DOCUMENT_NUDGE',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });
      if (recentNotif) continue; // Already nudged in last 24h

      await this.notifications.create({
        userId: c.userId,
        caseId: c.id,
        type: 'DOCUMENT_NUDGE',
        title: '📄 Action Required: Upload Documents',
        message: `Your case ${c.caseNumber} is waiting for document uploads. Please log in and complete the document upload step to continue your immigration process.`,
      });

      this.logger.log(`  ✅ Document nudge sent for case ${c.caseNumber}`);
    }
  }

  /**
   * Every Monday at 7 AM: AI generates a weekly case summary for each active case.
   */
  @Cron('0 7 * * 1')
  async generateWeeklySummaries() {
    this.logger.log('📊 [CRON] Generating weekly AI case summaries...');

    const activeCases = await this.prisma.case.findMany({
      where: {
        status: { in: ['IN_PROGRESS', 'CONSULTATION_SCHEDULED', 'LAWYER_ASSIGNED', 'COURT_DATE_ASSIGNED'] },
      },
      include: {
        member: { select: { id: true, name: true } },
        events: { orderBy: { createdAt: 'desc' }, take: 5 },
        appointments: { where: { scheduledAt: { gte: new Date() } }, take: 2 },
        courtDates: { where: { date: { gte: new Date() } }, take: 2 },
      },
      take: 50,
    });

    this.logger.log(`  Generating summaries for ${activeCases.length} active case(s)`);

    for (const c of activeCases) {
      try {
        const summary = await this.ai.summarizeCase({
          caseNumber: c.caseNumber,
          caseType: c.caseType,
          status: c.status,
          recentEvents: c.events.map((e: any) => e.title),
          upcomingAppointments: c.appointments.length,
          upcomingCourtDates: c.courtDates.length,
        });

        // Update case summary in DB
        await this.prisma.case.update({
          where: { id: c.id },
          data: { summary },
        });

        // Notify member with weekly update
        await this.notifications.create({
          userId: c.userId,
          caseId: c.id,
          type: 'WEEKLY_SUMMARY',
          title: '📊 Weekly Case Update',
          message: summary,
        });

        this.logger.log(`  ✅ Weekly summary generated for case ${c.caseNumber}`);
      } catch (err) {
        this.logger.error(`  ❌ Failed to generate summary for case ${c.caseNumber}`, err);
      }
    }
  }
}
