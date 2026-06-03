import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: WorkflowService,
    private readonly audit: AuditService,
  ) {}

  async create(caseId: string, lawyerId: string, dto: any, actorId: string) {
    // Find the Lawyer record by user id or lawyer record id
    let lawyerRecord = await this.prisma.lawyer.findUnique({ where: { id: lawyerId } });
    if (!lawyerRecord) {
      lawyerRecord = await this.prisma.lawyer.findUnique({ where: { userId: lawyerId } });
    }
    if (!lawyerRecord) throw new NotFoundException('Lawyer not found');

    const appointment = await this.prisma.appointment.create({
      data: {
        caseId,
        lawyerId: lawyerRecord.id,
        appointmentType: dto.appointmentType || 'CONSULTATION',
        scheduledAt: new Date(dto.scheduledAt),
        meetingLink: dto.meetingLink,
        notes: dto.notes,
        status: 'SCHEDULED',
      },
      include: { lawyer: { include: { user: { select: { name: true } } } } },
    });

    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'APPOINTMENT_SCHEDULED',
        title: `${dto.appointmentType || 'Consultation'} Scheduled`,
        description: `Appointment scheduled for ${new Date(dto.scheduledAt).toLocaleDateString()} with ${appointment.lawyer?.user?.name || 'your lawyer'}.`,
        actorType: 'USER',
        actorId,
        metadata: { appointmentId: appointment.id, type: dto.appointmentType, scheduledAt: dto.scheduledAt },
      },
    });

    if (caseRecord) {
      await this.prisma.notification.create({
        data: {
          userId: caseRecord.userId,
          caseId,
          type: 'APPOINTMENT_SCHEDULED',
          title: 'Appointment Scheduled',
          message: `Your ${dto.appointmentType || 'consultation'} is scheduled for ${new Date(dto.scheduledAt).toLocaleDateString()}.`,
        },
      });
    }

    try {
      await this.workflow.transition(caseId, 'CONSULTATION_SCHEDULED', actorId, 'Appointment booked', true);
    } catch {}

    await this.audit.log({ actorId, action: 'APPOINTMENT_CREATED', entityType: 'Appointment', entityId: appointment.id, payload: dto });
    return appointment;
  }

  async findByCase(caseId: string) {
    return this.prisma.appointment.findMany({
      where: { caseId },
      include: { lawyer: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findByLawyer(lawyerUserId: string) {
    const lawyer = await this.prisma.lawyer.findUnique({ where: { userId: lawyerUserId } });
    if (!lawyer) return [];
    return this.prisma.appointment.findMany({
      where: { lawyerId: lawyer.id },
      include: {
        case: { include: { member: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateStatus(id: string, status: string, actorId: string) {
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: { status: status as any },
    });

    const eventTitles: Record<string, string> = {
      CONFIRMED: 'Appointment Confirmed',
      RESCHEDULED: 'Appointment Rescheduled',
      CANCELLED: 'Appointment Cancelled',
      COMPLETED: 'Appointment Completed',
    };

    await this.prisma.caseEvent.create({
      data: {
        caseId: appointment.caseId,
        eventType: status === 'RESCHEDULED' ? 'APPOINTMENT_RESCHEDULED' : status === 'CANCELLED' ? 'APPOINTMENT_CANCELLED' : 'APPOINTMENT_COMPLETED',
        title: eventTitles[status] || `Appointment ${status}`,
        description: `Appointment status updated to ${status}.`,
        actorType: 'USER',
        actorId,
        metadata: { appointmentId: id, status },
      },
    });

    await this.audit.log({ actorId, action: `APPOINTMENT_${status}`, entityType: 'Appointment', entityId: id });
    return appointment;
  }
}
