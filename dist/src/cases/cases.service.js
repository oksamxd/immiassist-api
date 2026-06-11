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
const ai_service_1 = require("../ai/ai.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let CasesService = class CasesService {
    prisma;
    workflow;
    audit;
    ai;
    realtime;
    constructor(prisma, workflow, audit, ai, realtime) {
        this.prisma = prisma;
        this.workflow = workflow;
        this.audit = audit;
        this.ai = ai;
        this.realtime = realtime;
    }
    generateCaseNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `IMM-${timestamp}-${random}`;
    }
    async create(userId, dto) {
        const caseRecord = await this.prisma.case.create({
            data: {
                caseNumber: this.generateCaseNumber(),
                userId,
                caseType: dto.caseType,
                status: 'NEW',
                priority: dto.priority || 'MEDIUM',
                summary: dto.summary,
                detail: (dto.visaCategory || dto.issueType || dto.destinationCountry || dto.notes)
                    ? {
                        create: {
                            issueType: dto.issueType,
                            visaCategory: dto.visaCategory,
                            destinationCountry: dto.destinationCountry,
                            notes: dto.notes,
                        },
                    }
                    : undefined,
            },
            include: { events: true, detail: true },
        });
        await this.prisma.caseEvent.create({
            data: {
                caseId: caseRecord.id,
                eventType: 'CASE_CREATED',
                title: 'Case Opened',
                description: `New ${dto.caseType.replace(/_/g, ' ')} case created.`,
                actorType: 'USER',
                actorId: userId,
                metadata: { caseType: dto.caseType },
            },
        });
        this.realtime.notifyTimelineUpdate(caseRecord.id, { event: 'CASE_CREATED' });
        await this.audit.log({
            actorId: userId,
            action: 'CASE_CREATED',
            entityType: 'Case',
            entityId: caseRecord.id,
        });
        return caseRecord;
    }
    async startTenMinuteMode(caseId, userId) {
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId }, include: { member: { include: { profile: true } } } });
        if (!caseRecord)
            throw new common_1.NotFoundException('Case not found');
        const ctx = { profile: caseRecord.member?.profile };
        const plan = await this.ai.generateTenMinutePlan(ctx);
        await this.prisma.caseEvent.create({
            data: {
                caseId,
                eventType: 'TEN_MINUTE_PREP_STARTED',
                title: '10-Minute Prep Started',
                description: 'User initiated the 10-Minute Arrival Coach.',
                actorType: 'USER',
                actorId: userId,
                metadata: { plan },
            },
        });
        this.realtime.notifyTimelineUpdate(caseId, { event: 'TEN_MINUTE_PREP_STARTED' });
        return { success: true, plan };
    }
    async triggerAirportLive(caseId, userId, issueType, contextString) {
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId }, include: { member: { include: { profile: true } } } });
        if (!caseRecord)
            throw new common_1.NotFoundException('Case not found');
        const ctx = { profile: caseRecord.member?.profile };
        const risk = await this.ai.evaluateAirportRisk(ctx, issueType, contextString);
        await this.prisma.caseEvent.create({
            data: {
                caseId,
                eventType: 'AIRPORT_LIVE_TRIGGERED',
                title: 'Airport Live Mode Activated',
                description: `Emergency mode activated. Risk Level: ${risk.risk_level}`,
                actorType: 'USER',
                actorId: userId,
                metadata: { issueType, risk },
            },
        });
        this.realtime.notifyTimelineUpdate(caseId, { event: 'AIRPORT_LIVE_TRIGGERED' });
        if (risk.risk_level === 'HIGH' || risk.risk_level === 'CRITICAL') {
            await this.prisma.case.update({ where: { id: caseId }, data: { priority: 'URGENT' } });
            await this.prisma.caseEvent.create({
                data: {
                    caseId,
                    eventType: 'RISK_LEVEL_ESCALATED',
                    title: 'Case Escalated to URGENT',
                    description: 'Airport Live mode detected high risk.',
                    actorType: 'SYSTEM',
                    metadata: { risk },
                },
            });
            this.realtime.notifyTimelineUpdate(caseId, { event: 'RISK_LEVEL_ESCALATED' });
        }
        return { success: true, risk };
    }
    async findAllByUser(userId) {
        return this.prisma.case.findMany({
            where: { userId },
            include: {
                events: { orderBy: { createdAt: 'desc' }, take: 3 },
                detail: true,
                documents: { select: { id: true, documentType: true, verificationStatus: true } },
                appointments: { orderBy: { scheduledAt: 'asc' }, take: 1 },
                courtDates: { orderBy: { date: 'asc' }, take: 1 },
                assignedLawyer: { select: { id: true, name: true, profileImage: true } },
                assignedAssociate: { select: { id: true, name: true } },
                _count: { select: { documents: true, events: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findAllByLawyer(lawyerUserId) {
        return this.prisma.case.findMany({
            where: { assignedLawyerId: lawyerUserId },
            include: {
                member: { select: { id: true, name: true, email: true, profile: true } },
                detail: true,
                events: { orderBy: { createdAt: 'desc' }, take: 3 },
                documents: true,
                appointments: { orderBy: { scheduledAt: 'asc' } },
                courtDates: { orderBy: { date: 'asc' } },
                _count: { select: { documents: true, events: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findAllByAssociate(associateUserId) {
        return this.prisma.case.findMany({
            where: { assignedLegalAssociateId: associateUserId },
            include: {
                member: { select: { id: true, name: true, email: true, profile: true } },
                detail: true,
                events: { orderBy: { createdAt: 'desc' }, take: 3 },
                documents: true,
                assignedLawyer: { select: { id: true, name: true } },
                _count: { select: { documents: true, events: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findAll() {
        return this.prisma.case.findMany({
            include: {
                member: { select: { id: true, name: true, email: true } },
                assignedLawyer: { select: { id: true, name: true } },
                assignedAssociate: { select: { id: true, name: true } },
                detail: true,
                _count: { select: { documents: true, events: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const caseRecord = await this.prisma.case.findUnique({
            where: { id },
            include: {
                member: { select: { id: true, name: true, email: true, phone: true, profile: true } },
                assignedLawyer: { select: { id: true, name: true, email: true, lawyer: true } },
                assignedAssociate: { select: { id: true, name: true, email: true, legalAssociate: true } },
                detail: true,
                events: { orderBy: { createdAt: 'asc' } },
                documents: { orderBy: { createdAt: 'desc' } },
                sessions: { orderBy: { updatedAt: 'desc' }, take: 1 },
                appointments: { orderBy: { scheduledAt: 'asc' }, include: { lawyer: { include: { user: { select: { name: true } } } } } },
                courtDates: { orderBy: { date: 'asc' }, include: { lawyer: { include: { user: { select: { name: true } } } } } },
                statusHistory: { orderBy: { createdAt: 'desc' } },
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
    async update(caseId, dto, actorId) {
        const updated = await this.prisma.case.update({
            where: { id: caseId },
            data: {
                summary: dto.summary,
                priority: dto.priority,
                riskLevel: dto.riskLevel,
            },
        });
        if (dto.notes) {
            await this.prisma.caseEvent.create({
                data: {
                    caseId,
                    eventType: 'CASE_NOTE_ADDED',
                    title: 'Case Note Added',
                    description: dto.notes,
                    actorType: 'USER',
                    actorId,
                },
            });
            this.realtime.notifyTimelineUpdate(caseId, { event: 'CASE_NOTE_ADDED' });
        }
        await this.audit.log({ actorId, action: 'CASE_UPDATED', entityType: 'Case', entityId: caseId, payload: dto });
        return updated;
    }
};
exports.CasesService = CasesService;
exports.CasesService = CasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_service_1.WorkflowService,
        audit_service_1.AuditService,
        ai_service_1.AiService,
        realtime_gateway_1.RealtimeGateway])
], CasesService);
//# sourceMappingURL=cases.service.js.map