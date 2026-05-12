import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';
import { CreateCaseDto } from './dto/case.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: WorkflowService,
    private readonly audit: AuditService,
  ) {}

  private generateCaseNumber(): string {
    const prefix = 'IMM';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async create(userId: string, dto: CreateCaseDto) {
    const caseRecord = await this.prisma.case.create({
      data: {
        caseNumber: this.generateCaseNumber(),
        userId,
        caseType: dto.caseType as any,
        status: 'OPEN',
        summary: dto.summary,
      },
      include: { events: true },
    });

    // Create initial event
    await this.prisma.caseEvent.create({
      data: {
        caseId: caseRecord.id,
        eventType: 'CASE_CREATED',
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
        events: { orderBy: { createdAt: 'desc' }, take: 5 },
        travelPlan: true,
        _count: { select: { documents: true, sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, name: true, email: true } },
        events: { orderBy: { createdAt: 'desc' } },
        documents: true,
        travelPlan: true,
        sessions: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        lawyerAssignment: true,
        notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!caseRecord) throw new NotFoundException('Case not found');

    // Include valid transitions
    const validTransitions = this.workflow.getValidTransitions(caseRecord.status);
    return { ...caseRecord, validTransitions };
  }

  async updateStatus(caseId: string, newStatus: string, actorId: string, remarks?: string) {
    return this.workflow.transition(caseId, newStatus, actorId, remarks);
  }
}
