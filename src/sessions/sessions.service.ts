import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService, OnboardingContext } from '../ai/ai.service';
import { AuditService } from '../audit/audit.service';
import { CreateSessionDto } from './dto/session.dto';

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

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly audit: AuditService,
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
        passportNumber:        profile.passportNumber,
        nationality:           profile.nationality,
        visaType:              profile.visaType,
        countryOfResidence:    profile.countryOfResidence,
        preferredLanguage:     profile.preferredLanguage,
        emergencyContact:      profile.emergencyContact,
        portOfEntry:           profile.portOfEntry,
      },
      legalProfile: {
        currentVisaStatus:     legalProfile.currentVisaStatus,
        visaExpiry:            legalProfile.visaExpiry?.toISOString?.() || legalProfile.visaExpiry,
        currentEmployer:       legalProfile.currentEmployer,
        university:            legalProfile.university,
      },
      uploadedDocuments,
      requiredDocuments,
      caseType:    caseData?.caseType,
      caseStatus:  caseData?.status,
      caseNumber:  caseData?.caseNumber,
      lawyer:      caseData?.assignedLawyer ? { name: caseData.assignedLawyer.name } : undefined,
    };
  }

  async create(userId: string, dto: CreateSessionDto) {
    // Check if there's already an active session for this case
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

    // Build full onboarding context
    const ctx = await this.buildOnboardingContext(session.caseId);
    ctx.messageHistory = existingMessages;

    // Add user message
    existingMessages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Call Jana AI
    const orchestrationResult = await this.ai.orchestrate(ctx, message);
    const aiResponseJson = JSON.stringify(orchestrationResult);

    existingMessages.push({
      role: 'assistant',
      content: aiResponseJson,
      timestamp: new Date().toISOString(),
    });

    // Handle SAVE_PROFILE_FIELD action — auto-save profile data
    if (
      orchestrationResult.nextAction === 'SAVE_PROFILE_FIELD' &&
      orchestrationResult.fieldToSave?.field &&
      orchestrationResult.fieldToSave?.value
    ) {
      const { field, value } = orchestrationResult.fieldToSave;
      const memberFields = [
        'passportNumber', 'nationality', 'visaType', 'countryOfResidence',
        'portOfEntry', 'emergencyContact', 'preferredLanguage',
      ];
      const legalFields = [
        'currentVisaStatus', 'visaExpiry', 'currentEmployer', 'university'
      ];
      
      if (memberFields.includes(field)) {
        const updateData: any = { [field]: value };
        await this.prisma.memberProfile.upsert({
          where: { userId },
          update: updateData,
          create: { ...updateData, userId },
        });
      } else if (legalFields.includes(field)) {
        const updateData: any = {};
        if (field === 'visaExpiry') {
          const parsed = new Date(value);
          updateData[field] = isNaN(parsed.getTime()) ? undefined : parsed;
        } else {
          updateData[field] = value;
        }
        if (Object.keys(updateData).length > 0) {
          await this.prisma.legalProfile.upsert({
            where: { userId },
            update: updateData,
            create: { ...updateData, userId },
          });
        }
      }
    }

    // Handle ADVANCE_PHASE — update case status if needed
    if (orchestrationResult.nextAction === 'ADVANCE_PHASE' && orchestrationResult.caseStatus) {
      try {
        await this.prisma.case.update({
          where: { id: session.caseId },
          data: { status: orchestrationResult.caseStatus as any },
        });
      } catch { /* ignore if invalid status */ }
    }

    await this.prisma.guidanceSession.update({
      where: { id: sessionId },
      data: { messages: existingMessages },
    });

    // Create timeline event if Jana provided one
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
    }

    return {
      userMessage: { role: 'user', content: message },
      aiResponse: { role: 'assistant', content: aiResponseJson },
      phase: orchestrationResult.phase,
      nextAction: orchestrationResult.nextAction,
      messageCount: existingMessages.length,
    };
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
}
