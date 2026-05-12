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

    // Find available support agent with least active cases
    const agent = await this.prisma.supportAgent.findFirst({
      where: { isAvailable: true },
      orderBy: { activeCases: 'asc' },
    });

    if (!agent) throw new BadRequestException('No support agents available');

    // Update case
    await this.prisma.case.update({
      where: { id: caseId },
      data: { assignedSupportId: agent.userId },
    });

    // Increment agent active cases
    await this.prisma.supportAgent.update({
      where: { id: agent.id },
      data: { activeCases: { increment: 1 } },
    });

    // Transition status
    await this.workflow.transition(caseId, 'SUPPORT_ASSIGNED', actorId);

    // Create event
    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'SUPPORT_ASSIGNED',
        actorType: 'SYSTEM',
        metadata: { agentId: agent.id, agentName: agent.name },
      },
    });

    // Notify the member
    await this.prisma.notification.create({
      data: {
        userId: caseRecord.userId,
        caseId,
        type: 'SUPPORT_ASSIGNED',
        title: 'Support Agent Assigned',
        message: `Support agent ${agent.name} has been assigned to your case.`,
      },
    });

    await this.audit.log({
      actorId,
      action: 'SUPPORT_ASSIGNED',
      entityType: 'Case',
      entityId: caseId,
      payload: { agentId: agent.id },
    });

    return { caseId, agent: { id: agent.id, name: agent.name } };
  }

  async alertLawyer(caseId: string, actorId?: string) {
    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord) throw new NotFoundException('Case not found');

    // Find available lawyer
    const lawyer = await this.prisma.lawyer.findFirst({
      where: { isAvailable: true },
      orderBy: [{ rating: 'desc' }, { casesHandled: 'desc' }],
    });

    if (!lawyer) throw new BadRequestException('No lawyers available');

    // Create assignment
    await this.prisma.lawyerAssignment.create({
      data: {
        caseId,
        lawyerId: lawyer.id,
      },
    });

    // Update case
    await this.prisma.case.update({
      where: { id: caseId },
      data: { assignedLawyerId: lawyer.userId },
    });

    // Transition
    await this.workflow.transition(caseId, 'LAWYER_ALERTED', actorId);

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'LAWYER_ALERTED',
        actorType: 'SYSTEM',
        metadata: { lawyerId: lawyer.id, lawyerName: lawyer.name },
      },
    });

    // Notify member
    await this.prisma.notification.create({
      data: {
        userId: caseRecord.userId,
        caseId,
        type: 'LAWYER_ALERTED',
        title: 'Lawyer Alerted',
        message: `Immigration lawyer ${lawyer.name} has been alerted about your case.`,
      },
    });

    await this.audit.log({
      actorId,
      action: 'LAWYER_ALERTED',
      entityType: 'Case',
      entityId: caseId,
      payload: { lawyerId: lawyer.id },
    });

    return { caseId, lawyer: { id: lawyer.id, name: lawyer.name } };
  }

  async lawyerAccept(caseId: string, actorId: string) {
    const assignment = await this.prisma.lawyerAssignment.findUnique({ where: { caseId } });
    if (!assignment) throw new NotFoundException('No lawyer assignment found');

    await this.prisma.lawyerAssignment.update({
      where: { caseId },
      data: { isAccepted: true, acceptedAt: new Date() },
    });

    await this.workflow.transition(caseId, 'LAWYER_ACCEPTED', actorId);

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'LAWYER_ACCEPTED',
        actorType: 'USER',
        actorId,
        metadata: { assignmentId: assignment.id },
      },
    });

    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (caseRecord) {
      await this.prisma.notification.create({
        data: {
          userId: caseRecord.userId,
          caseId,
          type: 'LAWYER_ACCEPTED',
          title: 'Lawyer Accepted Your Case',
          message: 'An immigration lawyer has accepted your case and will be in touch shortly.',
        },
      });
    }

    return { caseId, accepted: true };
  }
}
