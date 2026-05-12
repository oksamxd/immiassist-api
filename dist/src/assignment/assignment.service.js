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
exports.AssignmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const audit_service_1 = require("../audit/audit.service");
const workflow_service_1 = require("../workflow/workflow.service");
let AssignmentService = class AssignmentService {
    prisma;
    audit;
    workflow;
    constructor(prisma, audit, workflow) {
        this.prisma = prisma;
        this.audit = audit;
        this.workflow = workflow;
    }
    async assignSupport(caseId, actorId) {
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
        if (!caseRecord)
            throw new common_1.NotFoundException('Case not found');
        const agent = await this.prisma.supportAgent.findFirst({
            where: { isAvailable: true },
            orderBy: { activeCases: 'asc' },
        });
        if (!agent)
            throw new common_1.BadRequestException('No support agents available');
        await this.prisma.case.update({
            where: { id: caseId },
            data: { assignedSupportId: agent.userId },
        });
        await this.prisma.supportAgent.update({
            where: { id: agent.id },
            data: { activeCases: { increment: 1 } },
        });
        await this.workflow.transition(caseId, 'SUPPORT_ASSIGNED', actorId);
        await this.prisma.caseEvent.create({
            data: {
                caseId,
                eventType: 'SUPPORT_ASSIGNED',
                actorType: 'SYSTEM',
                metadata: { agentId: agent.id, agentName: agent.name },
            },
        });
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
    async alertLawyer(caseId, actorId) {
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
        if (!caseRecord)
            throw new common_1.NotFoundException('Case not found');
        const lawyer = await this.prisma.lawyer.findFirst({
            where: { isAvailable: true },
            orderBy: [{ rating: 'desc' }, { casesHandled: 'desc' }],
        });
        if (!lawyer)
            throw new common_1.BadRequestException('No lawyers available');
        await this.prisma.lawyerAssignment.create({
            data: {
                caseId,
                lawyerId: lawyer.id,
            },
        });
        await this.prisma.case.update({
            where: { id: caseId },
            data: { assignedLawyerId: lawyer.userId },
        });
        await this.workflow.transition(caseId, 'LAWYER_ALERTED', actorId);
        await this.prisma.caseEvent.create({
            data: {
                caseId,
                eventType: 'LAWYER_ALERTED',
                actorType: 'SYSTEM',
                metadata: { lawyerId: lawyer.id, lawyerName: lawyer.name },
            },
        });
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
    async lawyerAccept(caseId, actorId) {
        const assignment = await this.prisma.lawyerAssignment.findUnique({ where: { caseId } });
        if (!assignment)
            throw new common_1.NotFoundException('No lawyer assignment found');
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
};
exports.AssignmentService = AssignmentService;
exports.AssignmentService = AssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        workflow_service_1.WorkflowService])
], AssignmentService);
//# sourceMappingURL=assignment.service.js.map