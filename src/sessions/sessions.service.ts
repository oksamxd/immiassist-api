import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { AuditService } from '../audit/audit.service';
import { CreateSessionDto } from './dto/session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly audit: AuditService,
  ) {}

  async create(userId: string, dto: CreateSessionDto) {
    const session = await this.prisma.guidanceSession.create({
      data: {
        caseId: dto.caseId,
        userId,
        sessionType: dto.sessionType as any,
        language: dto.language || 'English',
        status: 'ACTIVE',
        messages: [],
      },
    });

    // Generate initial AI greeting
    const caseData = await this.prisma.case.findUnique({
      where: { id: dto.caseId },
      include: { travelPlan: true, documents: { select: { type: true } } },
    });

    const greeting = await this.ai.generateGuidance(
      { caseType: caseData?.caseType, documents: caseData?.documents?.map((d) => d.type) },
      'Hello, I need immigration assistance.',
    );

    const messages = [
      { role: 'system', content: 'Session started', timestamp: new Date().toISOString() },
      { role: 'assistant', content: greeting, timestamp: new Date().toISOString() },
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

    const caseData = await this.prisma.case.findUnique({
      where: { id: session.caseId },
      include: { travelPlan: true, member: { include: { profile: true } } },
    });

    const existingMessages = (session.messages as any[]) || [];

    // Add user message
    existingMessages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Generate AI response
    const context = {
      caseType: caseData?.caseType,
      status: caseData?.status,
      visaType: caseData?.member?.profile?.visaType,
      nationality: caseData?.member?.profile?.nationality,
      travelPlan: caseData?.travelPlan
        ? {
            from: caseData.travelPlan.fromLocation,
            to: caseData.travelPlan.toLocation,
            port: caseData.travelPlan.portOfEntry,
          }
        : null,
      messageHistory: existingMessages.slice(-6),
    };

    const aiResponse = await this.ai.generateGuidance(context, message);

    existingMessages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    await this.prisma.guidanceSession.update({
      where: { id: sessionId },
      data: { messages: existingMessages },
    });

    // Create event
    await this.prisma.caseEvent.create({
      data: {
        caseId: session.caseId,
        eventType: 'AI_RESPONSE_GENERATED',
        actorType: 'SYSTEM',
        metadata: { sessionId, messageCount: existingMessages.length },
      },
    });

    return {
      userMessage: { role: 'user', content: message },
      aiResponse: { role: 'assistant', content: aiResponse },
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
