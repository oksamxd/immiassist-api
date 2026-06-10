import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CourtDatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: WorkflowService,
    private readonly audit: AuditService,
  ) {}

  async create(caseId: string, lawyerId: string, dto: any, actorId: string) {
    let lawyerRecord = await this.prisma.lawyer.findUnique({ where: { id: lawyerId } });
    if (!lawyerRecord) {
      lawyerRecord = await this.prisma.lawyer.findUnique({ where: { userId: lawyerId } });
    }
    if (!lawyerRecord) throw new NotFoundException('Lawyer not found');

    const courtDate = await this.prisma.courtDate.create({
      data: {
        caseId,
        lawyerId: lawyerRecord.id,
        date: new Date(dto.date),
        location: dto.location,
        notes: dto.notes,
        status: 'SCHEDULED',
      },
      include: { lawyer: { include: { user: { select: { name: true } } } } },
    });

    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'COURT_DATE_ASSIGNED',
        title: 'Court Date Assigned',
        description: `Court hearing scheduled for ${new Date(dto.date).toLocaleDateString()} at ${dto.location || 'TBD'}.`,
        actorType: 'USER',
        actorId,
        metadata: { courtDateId: courtDate.id, date: dto.date, location: dto.location },
      },
    });

    if (caseRecord) {
      await this.prisma.notification.create({
        data: {
          userId: caseRecord.userId,
          caseId,
          type: 'COURT_DATE_ASSIGNED',
          title: '⚖️ Court Date Assigned',
          message: `A court hearing has been scheduled for ${new Date(dto.date).toLocaleDateString()} at ${dto.location || 'a location TBD'}.`,
        },
      });
    }

    try {
      await this.workflow.transition(caseId, 'COURT_DATE_ASSIGNED', actorId, 'Court date set', true);
    } catch {}

    await this.audit.log({ actorId, action: 'COURT_DATE_CREATED', entityType: 'CourtDate', entityId: courtDate.id, payload: dto });
    return courtDate;
  }

  async findByCase(caseId: string) {
    return this.prisma.courtDate.findMany({
      where: { caseId },
      include: { lawyer: { include: { user: { select: { name: true } } } } },
      orderBy: { date: 'asc' },
    });
  }

  async findByLawyer(lawyerUserId: string) {
    const lawyer = await this.prisma.lawyer.findUnique({ where: { userId: lawyerUserId } });
    if (!lawyer) return [];
    return this.prisma.courtDate.findMany({
      where: { lawyerId: lawyer.id },
      include: { case: { include: { member: { select: { id: true, name: true } } } } },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Returns all upcoming (not completed/cancelled) court dates for a member's cases.
   */
  async findUpcomingByUser(userId: string) {
    return this.prisma.courtDate.findMany({
      where: {
        case: { userId },
        status: { in: ['SCHEDULED', 'POSTPONED'] },
        date: { gte: new Date() },
      },
      include: {
        case: { select: { caseNumber: true, caseType: true } },
        lawyer: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { date: 'asc' },
    });
  }

  async updateStatus(id: string, status: string, actorId: string, notes?: string) {
    const courtDate = await this.prisma.courtDate.update({
      where: { id },
      data: { status: status as any, notes: notes || undefined },
    });

    await this.prisma.caseEvent.create({
      data: {
        caseId: courtDate.caseId,
        eventType: 'COURT_DATE_UPDATED',
        title: `Court Date ${status}`,
        description: notes || `Court date status updated to ${status}.`,
        actorType: 'USER',
        actorId,
        metadata: { courtDateId: id, status },
      },
    });

    await this.audit.log({ actorId, action: `COURT_DATE_${status}`, entityType: 'CourtDate', entityId: id });
    return courtDate;
  }
}
