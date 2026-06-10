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
exports.CourtDatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const workflow_service_1 = require("../workflow/workflow.service");
const audit_service_1 = require("../audit/audit.service");
let CourtDatesService = class CourtDatesService {
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
        const courtDate = await this.prisma.courtDate.create({
            data: {
                caseId,
                lawyerId: lawyerRecord.id,
                date: new Date(dto.date),
                location: dto.location,
                notes: dto.notes,
                status: 'SCHEDULED',
            },
            include: { lawyer: { include: { user: { select: { name: true } } } } },
        });
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
        await this.prisma.caseEvent.create({
            data: {
                caseId,
                eventType: 'COURT_DATE_ASSIGNED',
                title: 'Court Date Assigned',
                description: `Court hearing scheduled for ${new Date(dto.date).toLocaleDateString()} at ${dto.location || 'TBD'}.`,
                actorType: 'USER',
                actorId,
                metadata: { courtDateId: courtDate.id, date: dto.date, location: dto.location },
            },
        });
        if (caseRecord) {
            await this.prisma.notification.create({
                data: {
                    userId: caseRecord.userId,
                    caseId,
                    type: 'COURT_DATE_ASSIGNED',
                    title: '⚖️ Court Date Assigned',
                    message: `A court hearing has been scheduled for ${new Date(dto.date).toLocaleDateString()} at ${dto.location || 'a location TBD'}.`,
                },
            });
        }
        try {
            await this.workflow.transition(caseId, 'COURT_DATE_ASSIGNED', actorId, 'Court date set', true);
        }
        catch { }
        await this.audit.log({ actorId, action: 'COURT_DATE_CREATED', entityType: 'CourtDate', entityId: courtDate.id, payload: dto });
        return courtDate;
    }
    async findByCase(caseId) {
        return this.prisma.courtDate.findMany({
            where: { caseId },
            include: { lawyer: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'asc' },
        });
    }
    async findByLawyer(lawyerUserId) {
        const lawyer = await this.prisma.lawyer.findUnique({ where: { userId: lawyerUserId } });
        if (!lawyer)
            return [];
        return this.prisma.courtDate.findMany({
            where: { lawyerId: lawyer.id },
            include: { case: { include: { member: { select: { id: true, name: true } } } } },
            orderBy: { date: 'asc' },
        });
    }
    async findUpcomingByUser(userId) {
        return this.prisma.courtDate.findMany({
            where: {
                case: { userId },
                status: { in: ['SCHEDULED', 'POSTPONED'] },
                date: { gte: new Date() },
            },
            include: {
                case: { select: { caseNumber: true, caseType: true } },
                lawyer: { include: { user: { select: { name: true, email: true } } } },
            },
            orderBy: { date: 'asc' },
        });
    }
    async updateStatus(id, status, actorId, notes) {
        const courtDate = await this.prisma.courtDate.update({
            where: { id },
            data: { status: status, notes: notes || undefined },
        });
        await this.prisma.caseEvent.create({
            data: {
                caseId: courtDate.caseId,
                eventType: 'COURT_DATE_UPDATED',
                title: `Court Date ${status}`,
                description: notes || `Court date status updated to ${status}.`,
                actorType: 'USER',
                actorId,
                metadata: { courtDateId: id, status },
            },
        });
        await this.audit.log({ actorId, action: `COURT_DATE_${status}`, entityType: 'CourtDate', entityId: id });
        return courtDate;
    }
};
exports.CourtDatesService = CourtDatesService;
exports.CourtDatesService = CourtDatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_service_1.WorkflowService,
        audit_service_1.AuditService])
], CourtDatesService);
//# sourceMappingURL=court-dates.service.js.map