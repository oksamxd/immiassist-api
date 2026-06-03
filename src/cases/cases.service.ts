import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

export interface CreateCaseDto {
  caseType: string;
  summary?: string;
  priority?: string;
  visaCategory?: string;
  destinationCountry?: string;
  issueType?: string;
  notes?: string;
}

export interface UpdateCaseDto {
  summary?: string;
  priority?: string;
  riskLevel?: string;
  notes?: string;
}

@Injectable()
export class CasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: WorkflowService,
    private readonly audit: AuditService,
  ) {}

  private generateCaseNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `IMM-${timestamp}-${random}`;
  }

  async create(userId: string, dto: CreateCaseDto) {
    const caseRecord = await this.prisma.case.create({
      data: {
        caseNumber: this.generateCaseNumber(),
        userId,
        caseType: dto.caseType as any,
        status: 'NEW',
        priority: (dto.priority as any) || 'MEDIUM',
        summary: dto.summary,
        detail: (dto.visaCategory || dto.issueType || dto.destinationCountry || dto.notes)
          ? {
              create: {
                issueType: dto.issueType,
                visaCategory: dto.visaCategory,
                destinationCountry: dto.destinationCountry,
                notes: dto.notes,
              },
            }
          : undefined,
      },
      include: { events: true, detail: true },
    });

    await this.prisma.caseEvent.create({
      data: {
        caseId: caseRecord.id,
        eventType: 'CASE_CREATED',
        title: 'Case Opened',
        description: `New ${dto.caseType.replace(/_/g, ' ')} case created.`,
        actorType: 'USER',
        actorId: userId,
        metadata: { caseType: dto.caseType },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'CASE_CREATED',
      entityType: 'Case',
      entityId: caseRecord.id,
    });

    return caseRecord;
  }

  async findAllByUser(userId: string) {
    return this.prisma.case.findMany({
      where: { userId },
      include: {
        events: { orderBy: { createdAt: 'desc' }, take: 3 },
        detail: true,
        documents: { select: { id: true, documentType: true, verificationStatus: true } },
        appointments: { orderBy: { scheduledAt: 'asc' }, take: 1 },
        courtDates: { orderBy: { date: 'asc' }, take: 1 },
        assignedLawyer: { select: { id: true, name: true, profileImage: true } },
        assignedAssociate: { select: { id: true, name: true } },
        _count: { select: { documents: true, events: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findAllByLawyer(lawyerUserId: string) {
    return this.prisma.case.findMany({
      where: { assignedLawyerId: lawyerUserId },
      include: {
        member: { select: { id: true, name: true, email: true, profile: true } },
        detail: true,
        events: { orderBy: { createdAt: 'desc' }, take: 3 },
        documents: true,
        appointments: { orderBy: { scheduledAt: 'asc' } },
        courtDates: { orderBy: { date: 'asc' } },
        _count: { select: { documents: true, events: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findAllByAssociate(associateUserId: string) {
    return this.prisma.case.findMany({
      where: { assignedLegalAssociateId: associateUserId },
      include: {
        member: { select: { id: true, name: true, email: true, profile: true } },
        detail: true,
        events: { orderBy: { createdAt: 'desc' }, take: 3 },
        documents: true,
        assignedLawyer: { select: { id: true, name: true } },
        _count: { select: { documents: true, events: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.case.findMany({
      include: {
        member: { select: { id: true, name: true, email: true } },
        assignedLawyer: { select: { id: true, name: true } },
        assignedAssociate: { select: { id: true, name: true } },
        detail: true,
        _count: { select: { documents: true, events: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, name: true, email: true, phone: true, profile: true } },
        assignedLawyer: { select: { id: true, name: true, email: true, lawyer: true } },
        assignedAssociate: { select: { id: true, name: true, email: true, legalAssociate: true } },
        detail: true,
        events: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        sessions: { orderBy: { updatedAt: 'desc' }, take: 1 },
        appointments: { orderBy: { scheduledAt: 'asc' }, include: { lawyer: { include: { user: { select: { name: true } } } } } },
        courtDates: { orderBy: { date: 'asc' }, include: { lawyer: { include: { user: { select: { name: true } } } } } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!caseRecord) throw new NotFoundException('Case not found');

    const validTransitions = this.workflow.getValidTransitions(caseRecord.status);
    return { ...caseRecord, validTransitions };
  }

  async updateStatus(caseId: string, newStatus: string, actorId: string, remarks?: string) {
    return this.workflow.transition(caseId, newStatus, actorId, remarks);
  }

  async update(caseId: string, dto: UpdateCaseDto, actorId: string) {
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: {
        summary: dto.summary,
        priority: dto.priority as any,
        riskLevel: dto.riskLevel as any,
      },
    });

    if (dto.notes) {
      await this.prisma.caseEvent.create({
        data: {
          caseId,
          eventType: 'CASE_NOTE_ADDED',
          title: 'Case Note Added',
          description: dto.notes,
          actorType: 'USER',
          actorId,
        },
      });
    }

    await this.audit.log({ actorId, action: 'CASE_UPDATED', entityType: 'Case', entityId: caseId, payload: dto });
    return updated;
  }
}
