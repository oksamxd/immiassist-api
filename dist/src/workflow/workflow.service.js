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
var WorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const audit_service_1 = require("../audit/audit.service");
const VALID_TRANSITIONS = {
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
let WorkflowService = WorkflowService_1 = class WorkflowService {
    prisma;
    audit;
    logger = new common_1.Logger(WorkflowService_1.name);
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    getValidTransitions(currentStatus) {
        return VALID_TRANSITIONS[currentStatus] || [];
    }
    async transition(caseId, newStatus, actorId, remarks, forceTransition = false) {
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
        if (!caseRecord)
            throw new common_1.BadRequestException('Case not found');
        const allowed = this.getValidTransitions(caseRecord.status);
        if (!forceTransition && !allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${caseRecord.status} to ${newStatus}. Allowed: ${allowed.join(', ')}`);
        }
        const updated = await this.prisma.case.update({
            where: { id: caseId },
            data: { status: newStatus, updatedAt: new Date() },
        });
        await this.prisma.caseStatusHistory.create({
            data: {
                caseId,
                oldStatus: caseRecord.status,
                newStatus: newStatus,
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
    async emitEvent(caseId, eventType, title, description, actorId, metadata) {
        return this.prisma.caseEvent.create({
            data: {
                caseId,
                eventType: eventType,
                title,
                description,
                actorType: actorId ? 'USER' : 'SYSTEM',
                actorId,
                metadata,
            },
        });
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = WorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map