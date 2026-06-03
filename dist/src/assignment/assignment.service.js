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
        const agent = await this.prisma.legalAssociate.findFirst({
            where: { availabilityStatus: true },
            orderBy: { activeCaseCount: 'asc' },
        });
        if (!agent)
            throw new common_1.BadRequestException('No legal associates available');
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
    async alertLawyer(caseId, actorId) {
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
        if (!caseRecord)
            throw new common_1.NotFoundException('Case not found');
        const lawyer = await this.prisma.lawyer.findFirst({
            where: { availabilityStatus: true },
            include: { user: true },
            orderBy: [{ rating: 'desc' }, { casesHandled: 'desc' }],
        });
        if (!lawyer)
            throw new common_1.BadRequestException('No lawyers available');
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
    async lawyerAccept(caseId, actorId) {
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