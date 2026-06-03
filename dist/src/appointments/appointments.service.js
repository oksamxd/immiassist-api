"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const workflow_service_1 = require("../workflow/workflow.service");
const audit_service_1 = require("../audit/audit.service");
let AppointmentsService = class AppointmentsService {
    prisma;
    workflow;
    audit;
    constructor(prisma, workflow, audit) {
        this.prisma = prisma;
        this.workflow = workflow;
        this.audit = audit;
    }
    async create(caseId, lawyerId, dto, actorId) {
        let lawyerRecord = await this.prisma.lawyer.findUnique({ where: { id: lawyerId } });
        if (!lawyerRecord) {
            lawyerRecord = await this.prisma.lawyer.findUnique({ where: { userId: lawyerId } });
        }
        if (!lawyerRecord)
            throw new common_1.NotFoundException('Lawyer not found');
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
        }
        catch { }
        await this.audit.log({ actorId, action: 'APPOINTMENT_CREATED', entityType: 'Appointment', entityId: appointment.id, payload: dto });
        return appointment;
    }
    async findByCase(caseId) {
        return this.prisma.appointment.findMany({
            where: { caseId },
            include: { lawyer: { include: { user: { select: { name: true, email: true } } } } },
            orderBy: { scheduledAt: 'asc' },
        });
    }
    async findByLawyer(lawyerUserId) {
        const lawyer = await this.prisma.lawyer.findUnique({ where: { userId: lawyerUserId } });
        if (!lawyer)
            return [];
        return this.prisma.appointment.findMany({
            where: { lawyerId: lawyer.id },
            include: {
                case: { include: { member: { select: { id: true, name: true, email: true } } } },
            },
            orderBy: { scheduledAt: 'asc' },
        });
    }
    async updateStatus(id, status, actorId) {
        const appointment = await this.prisma.appointment.update({
            where: { id },
            data: { status: status },
        });
        const eventTitles = {
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
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_service_1.WorkflowService,
        audit_service_1.AuditService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map