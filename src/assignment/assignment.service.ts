import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly workflow: WorkflowService,
  ) {}

  async assignSupport(caseId: string, actorId?: string) {
    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord) throw new NotFoundException('Case not found');

    const agent = await this.prisma.legalAssociate.findFirst({
      where: { availabilityStatus: true },
      orderBy: { activeCaseCount: 'asc' },
    });

    if (!agent) throw new BadRequestException('No legal associates available');

    await this.prisma.case.update({
      where: { id: caseId },
      data: { assignedLegalAssociateId: agent.userId },
    });

    await this.prisma.legalAssociate.update({
      where: { id: agent.id },
      data: { activeCaseCount: { increment: 1 } },
    });

    await this.workflow.transition(caseId, 'LEGAL_ASSOCIATE_ASSIGNED', actorId);

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'LEGAL_ASSOCIATE_ASSIGNED',
        title: 'Legal Associate Assigned',
        actorType: 'SYSTEM',
        metadata: { agentId: agent.id },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: caseRecord.userId,
        caseId,
        type: 'LEGAL_ASSOCIATE_ASSIGNED',
        title: 'Legal Associate Assigned',
        message: `A legal associate has been assigned to your case.`,
      },
    });

    await this.audit.log({
      actorId,
      action: 'LEGAL_ASSOCIATE_ASSIGNED',
      entityType: 'Case',
      entityId: caseId,
      payload: { agentId: agent.id },
    });

    return { caseId, agent: { id: agent.id } };
  }

  async alertLawyer(caseId: string, actorId?: string) {
    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord) throw new NotFoundException('Case not found');

    const lawyer = await this.prisma.lawyer.findFirst({
      where: { availabilityStatus: true },
      include: { user: true },
      orderBy: [{ rating: 'desc' }, { casesHandled: 'desc' }],
    });

    if (!lawyer) throw new BadRequestException('No lawyers available');

    await this.prisma.case.update({
      where: { id: caseId },
      data: { assignedLawyerId: lawyer.userId },
    });

    await this.workflow.transition(caseId, 'LAWYER_ASSIGNED', actorId);

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'LAWYER_ASSIGNED',
        title: 'Lawyer Assigned',
        actorType: 'SYSTEM',
        metadata: { lawyerId: lawyer.id, lawyerName: lawyer.user.name },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: caseRecord.userId,
        caseId,
        type: 'LAWYER_ASSIGNED',
        title: 'Lawyer Assigned',
        message: `Immigration lawyer ${lawyer.user.name} has been assigned to your case.`,
      },
    });

    await this.audit.log({
      actorId,
      action: 'LAWYER_ASSIGNED',
      entityType: 'Case',
      entityId: caseId,
      payload: { lawyerId: lawyer.id },
    });

    return { caseId, lawyer: { id: lawyer.id, name: lawyer.user.name } };
  }

  async lawyerAccept(caseId: string, actorId: string) {
    return { caseId, accepted: true };
  }
}
