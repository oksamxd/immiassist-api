import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService, OnboardingContext } from '../ai/ai.service';
import { AuditService } from '../audit/audit.service';
import { CreateSessionDto } from './dto/session.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const REQUIRED_PROFILE_FIELDS = [
  'passportNumber',
  'nationality',
  'visaType',
  'visaExpiry',
  'employerOrUniversity',
];

const REQUIRED_DOCUMENTS: Record<string, string[]> = {
  VISA_PROCESSING:    ['PASSPORT', 'VISA', 'I797'],
  WORK_PERMIT:        ['PASSPORT', 'VISA', 'EMPLOYMENT_LETTER'],
  STUDY_PERMIT:       ['PASSPORT', 'VISA', 'I20'],
  FAMILY_SPONSORSHIP: ['PASSPORT', 'VISA'],
  DEPORTATION:        ['PASSPORT', 'VISA', 'I797'],
  CITIZENSHIP:        ['PASSPORT'],
  DEFAULT:            ['PASSPORT', 'VISA'],
};

const COURT_DATE_KEYWORDS = ['court', 'hearing', 'court date', 'next hearing', 'court hearing', 'immigration court'];
const FAQ_KEYWORDS = ['what is', 'how do i', 'can i', 'faq', 'help me understand', 'explain', 'difference between'];

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeGateway,
  ) {}

  private getRequiredDocs(caseType?: string): string[] {
    return REQUIRED_DOCUMENTS[caseType || ''] || REQUIRED_DOCUMENTS.DEFAULT;
  }

  private async buildOnboardingContext(caseId: string): Promise<OnboardingContext> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        detail: true,
        member: { include: { profile: true, legalProfile: true } },
        documents: { select: { documentType: true } },
        assignedLawyer: { select: { name: true } },
        courtDates: {
          where: { status: 'SCHEDULED', date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 3,
        },
        appointments: {
          where: { status: { in: ['SCHEDULED', 'CONFIRMED'] }, scheduledAt: { gte: new Date() } },
          orderBy: { scheduledAt: 'asc' },
          take: 3,
          include: { lawyer: { include: { user: { select: { name: true } } } } },
        },
      },
    });

    const profile: any = caseData?.member?.profile || {};
    const legalProfile: any = (caseData?.member as any)?.legalProfile || {};
    const uploadedDocuments = (caseData?.documents || []).map((d: any) => d.documentType);
    const requiredDocuments = this.getRequiredDocs(caseData?.caseType);

    const partialCtx = { profile, legalProfile, uploadedDocuments };
    const phase = this.ai.detectPhase(partialCtx);

    return {
      phase,
      profile: {
        passportNumber:     profile.passportNumber,
        nationality:        profile.nationality,
        visaType:           profile.visaType,
        countryOfResidence: profile.countryOfResidence,
        preferredLanguage:  profile.preferredLanguage,
        emergencyContact:   profile.emergencyContact,
        portOfEntry:        profile.portOfEntry,
      },
      legalProfile: {
        currentVisaStatus: legalProfile.currentVisaStatus,
        visaExpiry:        legalProfile.visaExpiry?.toISOString?.() || legalProfile.visaExpiry,
        currentEmployer:   legalProfile.currentEmployer,
        university:        legalProfile.university,
      },
      uploadedDocuments,
      requiredDocuments,
      caseType:   caseData?.caseType,
      caseStatus: caseData?.status,
      caseNumber: caseData?.caseNumber,
      lawyer:     caseData?.assignedLawyer ? { name: caseData.assignedLawyer.name } : undefined,
      // Inject real court date + appointment data into context
      courtDates: (caseData?.courtDates || []).map((cd: any) => ({
        date: cd.date.toISOString(),
        location: cd.location,
        status: cd.status,
      })),
      upcomingAppointments: (caseData?.appointments || []).map((a: any) => ({
        scheduledAt: a.scheduledAt.toISOString(),
        type: a.appointmentType,
        lawyer: a.lawyer?.user?.name || 'Your lawyer',
        meetingLink: a.meetingLink,
      })),
    } as any;
  }

  async create(userId: string, dto: CreateSessionDto) {
    // Resume existing active session for this case if one exists
    const existing = await this.prisma.guidanceSession.findFirst({
      where: { caseId: dto.caseId, userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing;

    const session = await this.prisma.guidanceSession.create({
      data: {
        caseId: dto.caseId,
        userId,
        language: dto.language || 'English',
        status: 'ACTIVE',
        messages: [],
      },
    });

    const ctx = await this.buildOnboardingContext(dto.caseId);
    const greeting = await this.ai.orchestrate(ctx, 'Hello, I just registered and need immigration assistance.');
    const greetingJson = JSON.stringify(greeting);

    const messages = [
      { role: 'system', content: 'Session started', timestamp: new Date().toISOString() },
      { role: 'assistant', content: greetingJson, timestamp: new Date().toISOString() },
    ];

    await this.prisma.guidanceSession.update({
      where: { id: session.id },
      data: { messages },
    });

    await this.audit.log({
      actorId: userId,
      action: 'SESSION_STARTED',
      entityType: 'GuidanceSession',
      entityId: session.id,
    });

    return { ...session, messages };
  }

  async findOne(id: string) {
    const session = await this.prisma.guidanceSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async sendMessage(sessionId: string, userId: string, message: string) {
    const session = await this.prisma.guidanceSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const existingMessages = (session.messages as any[]) || [];

    // Build full onboarding context (includes court dates + appointments)
    const ctx = await this.buildOnboardingContext(session.caseId);
    ctx.messageHistory = existingMessages;

    // Inject court date information if user is asking about hearings
    const lowerMsg = message.toLowerCase();
    const isCourtQuery = COURT_DATE_KEYWORDS.some(kw => lowerMsg.includes(kw));
    const isFaqQuery = FAQ_KEYWORDS.some(kw => lowerMsg.includes(kw));

    // Augment the user message with real data context if asking about court dates
    let augmentedMessage = message;
    if (isCourtQuery && (ctx as any).courtDates?.length > 0) {
      const courtDates = (ctx as any).courtDates;
      const courtInfo = courtDates.map((cd: any) =>
        `Court hearing on ${new Date(cd.date).toLocaleDateString()} at ${cd.location || 'TBD'} (${cd.status})`
      ).join('; ');
      augmentedMessage = `${message}\n\n[SYSTEM CONTEXT - REAL DATA: The member's upcoming court dates are: ${courtInfo}]`;
    } else if (isCourtQuery) {
      augmentedMessage = `${message}\n\n[SYSTEM CONTEXT: No upcoming court dates are scheduled at this time.]`;
    }

    if ((ctx as any).upcomingAppointments?.length > 0 && (lowerMsg.includes('appointment') || lowerMsg.includes('consultation') || lowerMsg.includes('meeting'))) {
      const appts = (ctx as any).upcomingAppointments;
      const apptInfo = appts.map((a: any) =>
        `${a.type} with ${a.lawyer} on ${new Date(a.scheduledAt).toLocaleDateString()}${a.meetingLink ? ' (link: ' + a.meetingLink + ')' : ''}`
      ).join('; ');
      augmentedMessage = `${augmentedMessage}\n\n[SYSTEM CONTEXT - REAL DATA: Upcoming appointments: ${apptInfo}]`;
    }

    const userMsg = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    existingMessages.push(userMsg);

    const orchestrationResult = await this.ai.orchestrate(ctx, augmentedMessage);
    const aiResponseJson = JSON.stringify(orchestrationResult);

    const aiMsg = {
      role: 'assistant',
      content: aiResponseJson,
      timestamp: new Date().toISOString(),
    };
    existingMessages.push(aiMsg);

    // Handle SAVE_PROFILE_FIELD — auto-save profile data
    if (
      orchestrationResult.nextAction === 'SAVE_PROFILE_FIELD' &&
      orchestrationResult.fieldToSave?.field &&
      orchestrationResult.fieldToSave?.value
    ) {
      const { field, value } = orchestrationResult.fieldToSave;
      const memberFields = ['passportNumber', 'nationality', 'visaType', 'countryOfResidence', 'portOfEntry', 'emergencyContact', 'preferredLanguage'];
      const legalFields = ['currentVisaStatus', 'visaExpiry', 'currentEmployer', 'university'];

      if (memberFields.includes(field)) {
        await this.prisma.memberProfile.upsert({
          where: { userId },
          update: { [field]: value },
          create: { userId, [field]: value },
        });
      } else if (legalFields.includes(field)) {
        const updateData: any = {};
        if (field === 'visaExpiry') {
          const parsed = new Date(value);
          if (!isNaN(parsed.getTime())) {
            updateData[field] = parsed;
          } else {
            // Fallback for dumb orchestrator to prevent infinite loops when user enters junk
            updateData[field] = new Date('2030-01-01');
          }
        } else {
          updateData[field] = value;
        }
        if (Object.keys(updateData).length > 0) {
          await this.prisma.legalProfile.upsert({
            where: { userId },
            update: updateData,
            create: { userId, ...updateData },
          });
        }
      }
    }

    // Handle ADVANCE_PHASE — update case status
    if (orchestrationResult.nextAction === 'ADVANCE_PHASE' && orchestrationResult.caseStatus) {
      try {
        await this.prisma.case.update({
          where: { id: session.caseId },
          data: { status: orchestrationResult.caseStatus as any },
        });
      } catch { /* ignore invalid status */ }
    }

    // Handle UPDATE_CASE_TYPE
    if (orchestrationResult.nextAction === 'UPDATE_CASE_TYPE' && orchestrationResult.fieldToSave?.value) {
      const type = orchestrationResult.fieldToSave.value;
      try {
        await this.prisma.case.update({
          where: { id: session.caseId },
          data: { caseType: type as any },
        });
        await this.prisma.caseEvent.create({
          data: {
            caseId: session.caseId,
            eventType: 'CASE_STATUS_CHANGED',
            title: 'Case Type Selected',
            description: `User selected ${type.replace('_', ' ')} for this case.`,
            actorType: 'USER',
            actorId: userId,
          },
        });
        this.realtime.notifyTimelineUpdate(session.caseId, { event: 'CASE_STATUS_CHANGED' });
      } catch { /* ignore invalid type */ }
    }

    // Handle SCHEDULE_CONSULTATION
    if (orchestrationResult.nextAction === 'SCHEDULE_CONSULTATION' && orchestrationResult.appointmentDetails) {
      const { type, scheduledAt } = orchestrationResult.appointmentDetails;
      const caseRecord = await this.prisma.case.findUnique({ where: { id: session.caseId }, include: { member: true } });
      
      if (caseRecord?.assignedLawyerId) {
        const existingAppts = await this.prisma.appointment.findMany({
           where: { lawyerId: caseRecord.assignedLawyerId, status: { not: 'CANCELLED' } }
        });
        
        let targetDate = scheduledAt ? new Date(scheduledAt) : new Date();
        if (!scheduledAt) {
          targetDate.setDate(targetDate.getDate() + 1);
          targetDate.setHours(10, 0, 0, 0);
        }

        for (let i = 0; i < 5; i++) {
           const conflict = existingAppts.find(a => Math.abs(a.scheduledAt.getTime() - targetDate.getTime()) < 3600000);
           if (!conflict) break;
           targetDate.setHours(targetDate.getHours() + 1);
        }

        const finalScheduledAt = targetDate;

        await this.prisma.appointment.create({
          data: {
            caseId: session.caseId,
            lawyerId: caseRecord.assignedLawyerId,
            appointmentType: type as any,
            scheduledAt: finalScheduledAt,
            status: 'SCHEDULED',
          }
        });

        // Append the actual dynamic time to the AI's response so the user sees it
        orchestrationResult.message += ` I've successfully booked this for ${finalScheduledAt.toLocaleString()} based on your lawyer's availability.`;

        await this.prisma.case.update({
          where: { id: session.caseId },
          data: { status: 'INTAKE_IN_PROGRESS' }
        });
        await this.prisma.caseEvent.create({
          data: {
            caseId: session.caseId,
            eventType: 'APPOINTMENT_SCHEDULED',
            title: 'Consultation Scheduled',
            description: `A ${type.replace('_', ' ')} has been scheduled for ${finalScheduledAt.toLocaleString()}.`,
            actorType: 'SYSTEM',
          }
        });
        this.realtime.notifyTimelineUpdate(session.caseId, { event: 'APPOINTMENT_SCHEDULED' });

        const lawyer = await this.prisma.lawyer.findUnique({ where: { id: caseRecord.assignedLawyerId } });
        if (lawyer) {
           await this.prisma.notification.create({
             data: {
               userId: lawyer.userId,
               caseId: session.caseId,
               type: 'CONSULTATION_SCHEDULED',
               title: '📅 New Consultation Booked',
               message: `You have a new consultation scheduled on ${finalScheduledAt.toLocaleString()} for case ${caseRecord.caseNumber}. Context gathered: ${JSON.stringify({ profile: ctx.profile, legalProfile: ctx.legalProfile })}`,
             }
           });
        }
      } else {
        await this.prisma.case.update({
          where: { id: session.caseId },
          data: { status: 'INTAKE_IN_PROGRESS' }
        });
        await this.prisma.caseEvent.create({
          data: {
            caseId: session.caseId,
            eventType: 'CASE_NOTE_ADDED',
            title: 'Consultation Requested',
            description: `A consultation has been requested but no lawyer is assigned yet.`,
            actorType: 'SYSTEM',
          }
        });
        this.realtime.notifyTimelineUpdate(session.caseId, { event: 'CASE_NOTE_ADDED' });
      }
    }

    await this.prisma.guidanceSession.update({
      where: { id: sessionId },
      data: { messages: existingMessages },
    });

    // Log AI event to case timeline
    if (orchestrationResult.timelineEvent) {
      await this.prisma.caseEvent.create({
        data: {
          caseId: session.caseId,
          eventType: (orchestrationResult.timelineEvent.type as any) || 'AI_RESPONSE_GENERATED',
          title: orchestrationResult.timelineEvent.title || 'Jana AI Response',
          description: orchestrationResult.timelineEvent.description,
          actorType: 'SYSTEM',
          metadata: { sessionId, phase: orchestrationResult.phase },
        },
      });
      this.realtime.notifyTimelineUpdate(session.caseId, { event: orchestrationResult.timelineEvent.type });
    }

    this.realtime.notifyChatMessage(session.caseId, { messages: [userMsg, aiMsg] });

    return {
      userMessage: { role: 'user', content: message },
      aiResponse: { role: 'assistant', content: aiResponseJson },
      phase: orchestrationResult.phase,
      nextAction: orchestrationResult.nextAction,
      messageCount: existingMessages.length,
    };
  }

  /**
   * Legal team sends a message directly into a case's active guidance session.
   * The message appears as role 'legal' so the member can see it in chat.
   */
  async sendLegalMessage(caseId: string, actorId: string, message: string) {
    const session = await this.prisma.guidanceSession.findFirst({
      where: { caseId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
    });

    if (!session) {
      throw new NotFoundException('No active guidance session found for this case');
    }

    const existingMessages = (session.messages as any[]) || [];
    const legalMessage = {
      role: 'legal',
      content: message,
      timestamp: new Date().toISOString(),
      actorId,
    };
    existingMessages.push(legalMessage);

    await this.prisma.guidanceSession.update({
      where: { id: session.id },
      data: { messages: existingMessages },
    });

    // Create a case event to log this
    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'CASE_NOTE_ADDED',
        title: 'Legal Team Message',
        description: message,
        actorType: 'USER',
        actorId,
        metadata: { type: 'legal_reply', sessionId: session.id },
      },
    });
    this.realtime.notifyTimelineUpdate(caseId, { event: 'CASE_NOTE_ADDED' });
    this.realtime.notifyChatMessage(caseId, { messages: [legalMessage] });

    // Notify the case member
    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (caseRecord) {
      await this.prisma.notification.create({
        data: {
          userId: caseRecord.userId,
          caseId,
          type: 'LEGAL_TEAM_MESSAGE',
          title: '💬 Message from Your Legal Team',
          message,
        },
      });
    }

    await this.audit.log({
      actorId,
      action: 'LEGAL_MESSAGE_SENT',
      entityType: 'GuidanceSession',
      entityId: session.id,
      payload: { caseId, message },
    });

    return { success: true, message: legalMessage };
  }

  async close(sessionId: string) {
    return this.prisma.guidanceSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.guidanceSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { case: { select: { caseNumber: true, caseType: true, status: true } } },
    });
  }

  async findByCaseForLegalTeam(caseId: string) {
    return this.prisma.guidanceSession.findMany({
      where: { caseId },
      orderBy: { updatedAt: 'desc' },
      include: { case: { select: { caseNumber: true, caseType: true, status: true } } },
    });
  }
}
