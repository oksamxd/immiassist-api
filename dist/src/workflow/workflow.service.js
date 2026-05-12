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
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const audit_service_1 = require("../audit/audit.service");
const VALID_TRANSITIONS = {
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
let WorkflowService = class WorkflowService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    getValidTransitions(currentStatus) {
        return VALID_TRANSITIONS[currentStatus] || [];
    }
    async transition(caseId, newStatus, actorId, remarks) {
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
        if (!caseRecord)
            throw new common_1.BadRequestException('Case not found');
        const allowed = this.getValidTransitions(caseRecord.status);
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${caseRecord.status} to ${newStatus}. Allowed: ${allowed.join(', ')}`);
        }
        const updated = await this.prisma.case.update({
            where: { id: caseId },
            data: { status: newStatus },
        });
        await this.prisma.caseStatusHistory.create({
            data: {
                caseId,
                oldStatus: caseRecord.status,
                newStatus: newStatus,
                remarks,
            },
        });
        await this.prisma.caseEvent.create({
            data: {
                caseId,
                eventType: 'STATUS_CHANGED',
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
        return updated;
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map