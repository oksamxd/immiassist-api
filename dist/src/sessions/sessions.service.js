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
const REQUIRED_PROFILE_FIELDS = [
    'passportNumber',
    'nationality',
    'visaType',
    'visaExpiry',
    'employerOrUniversity',
];
const REQUIRED_DOCUMENTS = {
    VISA_PROCESSING: ['PASSPORT', 'VISA', 'I797'],
    WORK_PERMIT: ['PASSPORT', 'VISA', 'EMPLOYMENT_LETTER'],
    STUDY_PERMIT: ['PASSPORT', 'VISA', 'I20'],
    FAMILY_SPONSORSHIP: ['PASSPORT', 'VISA'],
    DEPORTATION: ['PASSPORT', 'VISA', 'I797'],
    CITIZENSHIP: ['PASSPORT'],
    DEFAULT: ['PASSPORT', 'VISA'],
};
let SessionsService = class SessionsService {
    prisma;
    ai;
    audit;
    constructor(prisma, ai, audit) {
        this.prisma = prisma;
        this.ai = ai;
        this.audit = audit;
    }
    getRequiredDocs(caseType) {
        return REQUIRED_DOCUMENTS[caseType || ''] || REQUIRED_DOCUMENTS.DEFAULT;
    }
    async buildOnboardingContext(caseId) {
        const caseData = await this.prisma.case.findUnique({
            where: { id: caseId },
            include: {
                detail: true,
                member: { include: { profile: true, legalProfile: true } },
                documents: { select: { documentType: true } },
                assignedLawyer: { select: { name: true } },
            },
        });
        const profile = caseData?.member?.profile || {};
        const legalProfile = caseData?.member?.legalProfile || {};
        const uploadedDocuments = (caseData?.documents || []).map((d) => d.documentType);
        const requiredDocuments = this.getRequiredDocs(caseData?.caseType);
        const partialCtx = { profile, legalProfile, uploadedDocuments };
        const phase = this.ai.detectPhase(partialCtx);
        return {
            phase,
            profile: {
                passportNumber: profile.passportNumber,
                nationality: profile.nationality,
                visaType: profile.visaType,
                countryOfResidence: profile.countryOfResidence,
                preferredLanguage: profile.preferredLanguage,
                emergencyContact: profile.emergencyContact,
                portOfEntry: profile.portOfEntry,
            },
            legalProfile: {
                currentVisaStatus: legalProfile.currentVisaStatus,
                visaExpiry: legalProfile.visaExpiry?.toISOString?.() || legalProfile.visaExpiry,
                currentEmployer: legalProfile.currentEmployer,
                university: legalProfile.university,
            },
            uploadedDocuments,
            requiredDocuments,
            caseType: caseData?.caseType,
            caseStatus: caseData?.status,
            caseNumber: caseData?.caseNumber,
            lawyer: caseData?.assignedLawyer ? { name: caseData.assignedLawyer.name } : undefined,
        };
    }
    async create(userId, dto) {
        const existing = await this.prisma.guidanceSession.findFirst({
            where: { caseId: dto.caseId, userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
        if (existing)
            return existing;
        const session = await this.prisma.guidanceSession.create({
            data: {
                caseId: dto.caseId,
                userId,
                language: dto.language || 'English',
                status: 'ACTIVE',
                messages: [],
            },
        });
        const ctx = await this.buildOnboardingContext(dto.caseId);
        const greeting = await this.ai.orchestrate(ctx, 'Hello, I just registered and need immigration assistance.');
        const greetingJson = JSON.stringify(greeting);
        const messages = [
            { role: 'system', content: 'Session started', timestamp: new Date().toISOString() },
            { role: 'assistant', content: greetingJson, timestamp: new Date().toISOString() },
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
        const existingMessages = session.messages || [];
        const ctx = await this.buildOnboardingContext(session.caseId);
        ctx.messageHistory = existingMessages;
        existingMessages.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        });
        const orchestrationResult = await this.ai.orchestrate(ctx, message);
        const aiResponseJson = JSON.stringify(orchestrationResult);
        existingMessages.push({
            role: 'assistant',
            content: aiResponseJson,
            timestamp: new Date().toISOString(),
        });
        if (orchestrationResult.nextAction === 'SAVE_PROFILE_FIELD' &&
            orchestrationResult.fieldToSave?.field &&
            orchestrationResult.fieldToSave?.value) {
            const { field, value } = orchestrationResult.fieldToSave;
            const memberFields = [
                'passportNumber', 'nationality', 'visaType', 'countryOfResidence',
                'portOfEntry', 'emergencyContact', 'preferredLanguage',
            ];
            const legalFields = [
                'currentVisaStatus', 'visaExpiry', 'currentEmployer', 'university'
            ];
            if (memberFields.includes(field)) {
                const updateData = { [field]: value };
                await this.prisma.memberProfile.upsert({
                    where: { userId },
                    update: updateData,
                    create: { ...updateData, userId },
                });
            }
            else if (legalFields.includes(field)) {
                const updateData = {};
                if (field === 'visaExpiry') {
                    const parsed = new Date(value);
                    updateData[field] = isNaN(parsed.getTime()) ? undefined : parsed;
                }
                else {
                    updateData[field] = value;
                }
                if (Object.keys(updateData).length > 0) {
                    await this.prisma.legalProfile.upsert({
                        where: { userId },
                        update: updateData,
                        create: { ...updateData, userId },
                    });
                }
            }
        }
        if (orchestrationResult.nextAction === 'ADVANCE_PHASE' && orchestrationResult.caseStatus) {
            try {
                await this.prisma.case.update({
                    where: { id: session.caseId },
                    data: { status: orchestrationResult.caseStatus },
                });
            }
            catch { }
        }
        await this.prisma.guidanceSession.update({
            where: { id: sessionId },
            data: { messages: existingMessages },
        });
        if (orchestrationResult.timelineEvent) {
            await this.prisma.caseEvent.create({
                data: {
                    caseId: session.caseId,
                    eventType: orchestrationResult.timelineEvent.type || 'AI_RESPONSE_GENERATED',
                    title: orchestrationResult.timelineEvent.title || 'Jana AI Response',
                    description: orchestrationResult.timelineEvent.description,
                    actorType: 'SYSTEM',
                    metadata: { sessionId, phase: orchestrationResult.phase },
                },
            });
        }
        return {
            userMessage: { role: 'user', content: message },
            aiResponse: { role: 'assistant', content: aiResponseJson },
            phase: orchestrationResult.phase,
            nextAction: orchestrationResult.nextAction,
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