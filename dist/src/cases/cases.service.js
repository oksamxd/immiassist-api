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
exports.CasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const workflow_service_1 = require("../workflow/workflow.service");
const audit_service_1 = require("../audit/audit.service");
let CasesService = class CasesService {
    prisma;
    workflow;
    audit;
    constructor(prisma, workflow, audit) {
        this.prisma = prisma;
        this.workflow = workflow;
        this.audit = audit;
    }
    generateCaseNumber() {
        const prefix = 'IMM';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
    async create(userId, dto) {
        const caseRecord = await this.prisma.case.create({
            data: {
                caseNumber: this.generateCaseNumber(),
                userId,
                caseType: dto.caseType,
                status: 'OPEN',
                summary: dto.summary,
            },
            include: { events: true },
        });
        await this.prisma.caseEvent.create({
            data: {
                caseId: caseRecord.id,
                eventType: 'CASE_CREATED',
                actorType: 'USER',
                actorId: userId,
                metadata: { caseType: dto.caseType },
            },
        });
        await this.audit.log({
            actorId: userId,
            action: 'CASE_CREATED',
            entityType: 'Case',
            entityId: caseRecord.id,
        });
        return caseRecord;
    }
    async findAllByUser(userId) {
        return this.prisma.case.findMany({
            where: { userId },
            include: {
                events: { orderBy: { createdAt: 'desc' }, take: 5 },
                travelPlan: true,
                _count: { select: { documents: true, sessions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const caseRecord = await this.prisma.case.findUnique({
            where: { id },
            include: {
                member: { select: { id: true, name: true, email: true } },
                events: { orderBy: { createdAt: 'desc' } },
                documents: true,
                travelPlan: true,
                sessions: { orderBy: { createdAt: 'desc' } },
                statusHistory: { orderBy: { createdAt: 'desc' } },
                lawyerAssignment: true,
                notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
        if (!caseRecord)
            throw new common_1.NotFoundException('Case not found');
        const validTransitions = this.workflow.getValidTransitions(caseRecord.status);
        return { ...caseRecord, validTransitions };
    }
    async updateStatus(caseId, newStatus, actorId, remarks) {
        return this.workflow.transition(caseId, newStatus, actorId, remarks);
    }
};
exports.CasesService = CasesService;
exports.CasesService = CasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_service_1.WorkflowService,
        audit_service_1.AuditService])
], CasesService);
//# sourceMappingURL=cases.service.js.map