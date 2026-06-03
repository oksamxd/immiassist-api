import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ['INTAKE_IN_PROGRESS', 'CLOSED'],
  INTAKE_IN_PROGRESS: ['DOCUMENTS_PENDING', 'UNDER_REVIEW', 'LEGAL_ASSOCIATE_ASSIGNED', 'CLOSED'],
  DOCUMENTS_PENDING: ['UNDER_REVIEW', 'WAITING_FOR_DOCUMENTS', 'INTAKE_IN_PROGRESS'],
  UNDER_REVIEW: ['LEGAL_ASSOCIATE_ASSIGNED', 'LAWYER_ASSIGNED', 'DOCUMENTS_PENDING'],
  LEGAL_ASSOCIATE_ASSIGNED: ['UNDER_REVIEW', 'LAWYER_ASSIGNED', 'WAITING_FOR_DOCUMENTS'],
  LAWYER_ASSIGNED: ['CONSULTATION_SCHEDULED', 'WAITING_FOR_DOCUMENTS', 'COURT_DATE_ASSIGNED', 'IN_PROGRESS'],
  CONSULTATION_SCHEDULED: ['IN_PROGRESS', 'WAITING_FOR_DOCUMENTS', 'FOLLOWUP_PENDING'],
  WAITING_FOR_DOCUMENTS: ['UNDER_REVIEW', 'IN_PROGRESS', 'DOCUMENTS_PENDING'],
  COURT_DATE_ASSIGNED: ['IN_PROGRESS', 'FOLLOWUP_PENDING', 'RESOLVED'],
  FOLLOWUP_PENDING: ['CONSULTATION_SCHEDULED', 'IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['WAITING_FOR_DOCUMENTS', 'COURT_DATE_ASSIGNED', 'FOLLOWUP_PENDING', 'RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  getValidTransitions(currentStatus: string): string[] {
    return VALID_TRANSITIONS[currentStatus] || [];
  }

  async transition(
    caseId: string,
    newStatus: string,
    actorId?: string,
    remarks?: string,
    forceTransition = false,
  ) {
    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord) throw new BadRequestException('Case not found');

    const allowed = this.getValidTransitions(caseRecord.status);
    if (!forceTransition && !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${caseRecord.status} to ${newStatus}. Allowed: ${allowed.join(', ')}`,
      );
    }

    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: newStatus as any, updatedAt: new Date() },
    });

    await this.prisma.caseStatusHistory.create({
      data: {
        caseId,
        oldStatus: caseRecord.status,
        newStatus: newStatus as any,
        remarks,
        actorId,
      },
    });

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'CASE_STATUS_CHANGED',
        title: `Status updated to ${newStatus.replace(/_/g, ' ')}`,
        description: remarks || `Case status changed from ${caseRecord.status} to ${newStatus}.`,
        actorType: actorId ? 'USER' : 'SYSTEM',
        actorId,
        metadata: { from: caseRecord.status, to: newStatus, remarks },
      },
    });

    await this.audit.log({
      actorId,
      action: 'CASE_STATUS_TRANSITION',
      entityType: 'Case',
      entityId: caseId,
      payload: { from: caseRecord.status, to: newStatus },
    });

    this.logger.log(`Case ${caseId}: ${caseRecord.status} → ${newStatus}`);
    return updated;
  }

  async emitEvent(caseId: string, eventType: string, title: string, description?: string, actorId?: string, metadata?: any) {
    return this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: eventType as any,
        title,
        description,
        actorType: actorId ? 'USER' : 'SYSTEM',
        actorId,
        metadata,
      },
    });
  }
}
