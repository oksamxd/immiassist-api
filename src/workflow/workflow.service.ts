import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

// Valid state transitions for immigration cases
const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['TRAVEL_PREP', 'TEN_MIN_ACTIVE', 'CLOSED'],
  TRAVEL_PREP: ['PREPARATION_READY', 'CLOSED'],
  PREPARATION_READY: ['TEN_MIN_ACTIVE', 'CLOSED'],
  TEN_MIN_ACTIVE: ['ARRIVING_AT_PORT', 'CLOSED'],
  ARRIVING_AT_PORT: ['CLEARED', 'QUESTIONED', 'DETAINED'],
  CLEARED: ['RESOLVED', 'CLOSED'],
  QUESTIONED: ['CLEARED', 'DETAINED', 'SUPPORT_ASSIGNED'],
  DETAINED: ['SUPPORT_ASSIGNED', 'LAWYER_ALERTED'],
  SUPPORT_ASSIGNED: ['LAWYER_ALERTED', 'RESOLVED'],
  LAWYER_ALERTED: ['LAWYER_ACCEPTED'],
  LAWYER_ACCEPTED: ['CONSULTATION'],
  CONSULTATION: ['NOTICE_UPLOADED', 'RESOLVED'],
  NOTICE_UPLOADED: ['RISK_CLASSIFIED'],
  RISK_CLASSIFIED: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
};

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  getValidTransitions(currentStatus: string): string[] {
    return VALID_TRANSITIONS[currentStatus] || [];
  }

  async transition(caseId: string, newStatus: string, actorId?: string, remarks?: string) {
    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord) throw new BadRequestException('Case not found');

    const allowed = this.getValidTransitions(caseRecord.status);
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${caseRecord.status} to ${newStatus}. Allowed: ${allowed.join(', ')}`,
      );
    }

    // Update case status
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: newStatus as any },
    });

    // Record status history
    await this.prisma.caseStatusHistory.create({
      data: {
        caseId,
        oldStatus: caseRecord.status,
        newStatus: newStatus as any,
        remarks,
      },
    });

    // Create case event
    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'STATUS_CHANGED',
        actorType: actorId ? 'USER' : 'SYSTEM',
        actorId,
        metadata: { from: caseRecord.status, to: newStatus, remarks },
      },
    });

    // Audit log
    await this.audit.log({
      actorId,
      action: 'CASE_STATUS_TRANSITION',
      entityType: 'Case',
      entityId: caseId,
      payload: { from: caseRecord.status, to: newStatus },
    });

    return updated;
  }
}
