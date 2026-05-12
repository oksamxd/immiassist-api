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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const ai_service_1 = require("../ai/ai.service");
const audit_service_1 = require("../audit/audit.service");
let SessionsService = class SessionsService {
    prisma;
    ai;
    audit;
    constructor(prisma, ai, audit) {
        this.prisma = prisma;
        this.ai = ai;
        this.audit = audit;
    }
    async create(userId, dto) {
        const session = await this.prisma.guidanceSession.create({
            data: {
                caseId: dto.caseId,
                userId,
                sessionType: dto.sessionType,
                language: dto.language || 'English',
                status: 'ACTIVE',
                messages: [],
            },
        });
        const caseData = await this.prisma.case.findUnique({
            where: { id: dto.caseId },
            include: { travelPlan: true, documents: { select: { type: true } } },
        });
        const greeting = await this.ai.generateGuidance({ caseType: caseData?.caseType, documents: caseData?.documents?.map((d) => d.type) }, 'Hello, I need immigration assistance.');
        const messages = [
            { role: 'system', content: 'Session started', timestamp: new Date().toISOString() },
            { role: 'assistant', content: greeting, timestamp: new Date().toISOString() },
        ];
        await this.prisma.guidanceSession.update({
            where: { id: session.id },
            data: { messages },
        });
        await this.audit.log({
            actorId: userId,
            action: 'SESSION_STARTED',
            entityType: 'GuidanceSession',
            entityId: session.id,
        });
        return { ...session, messages };
    }
    async findOne(id) {
        const session = await this.prisma.guidanceSession.findUnique({ where: { id } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        return session;
    }
    async sendMessage(sessionId, userId, message) {
        const session = await this.prisma.guidanceSession.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const caseData = await this.prisma.case.findUnique({
            where: { id: session.caseId },
            include: { travelPlan: true, member: { include: { profile: true } } },
        });
        const existingMessages = session.messages || [];
        existingMessages.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        });
        const context = {
            caseType: caseData?.caseType,
            status: caseData?.status,
            visaType: caseData?.member?.profile?.visaType,
            nationality: caseData?.member?.profile?.nationality,
            travelPlan: caseData?.travelPlan
                ? {
                    from: caseData.travelPlan.fromLocation,
                    to: caseData.travelPlan.toLocation,
                    port: caseData.travelPlan.portOfEntry,
                }
                : null,
            messageHistory: existingMessages.slice(-6),
        };
        const aiResponse = await this.ai.generateGuidance(context, message);
        existingMessages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString(),
        });
        await this.prisma.guidanceSession.update({
            where: { id: sessionId },
            data: { messages: existingMessages },
        });
        await this.prisma.caseEvent.create({
            data: {
                caseId: session.caseId,
                eventType: 'AI_RESPONSE_GENERATED',
                actorType: 'SYSTEM',
                metadata: { sessionId, messageCount: existingMessages.length },
            },
        });
        return {
            userMessage: { role: 'user', content: message },
            aiResponse: { role: 'assistant', content: aiResponse },
            messageCount: existingMessages.length,
        };
    }
    async close(sessionId) {
        return this.prisma.guidanceSession.update({
            where: { id: sessionId },
            data: { status: 'COMPLETED' },
        });
    }
    async findByUser(userId) {
        return this.prisma.guidanceSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { case: { select: { caseNumber: true, caseType: true, status: true } } },
        });
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService,
        audit_service_1.AuditService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map