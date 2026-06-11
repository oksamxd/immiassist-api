import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { AuditService } from '../audit/audit.service';
import { CreateSessionDto } from './dto/session.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class SessionsService {
    private readonly prisma;
    private readonly ai;
    private readonly audit;
    private readonly realtime;
    constructor(prisma: PrismaService, ai: AiService, audit: AuditService, realtime: RealtimeGateway);
    private getRequiredDocs;
    private buildOnboardingContext;
    create(userId: string, dto: CreateSessionDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        caseId: string;
        language: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    } | {
        messages: {
            role: string;
            content: string;
            timestamp: string;
        }[];
        id: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        caseId: string;
        language: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        caseId: string;
        language: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    sendMessage(sessionId: string, userId: string, message: string): Promise<{
        userMessage: {
            role: string;
            content: string;
        };
        aiResponse: {
            role: string;
            content: string;
        };
        phase: import("../ai/ai.service").OnboardingPhase | undefined;
        nextAction: string | undefined;
        messageCount: number;
    }>;
    sendLegalMessage(caseId: string, actorId: string, message: string): Promise<{
        success: boolean;
        message: {
            role: string;
            content: string;
            timestamp: string;
            actorId: string;
        };
    }>;
    close(sessionId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        caseId: string;
        language: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findByUser(userId: string): Promise<({
        case: {
            caseType: import("@prisma/client").$Enums.CaseType;
            caseNumber: string;
            status: import("@prisma/client").$Enums.CaseStatus;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        caseId: string;
        language: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findByCaseForLegalTeam(caseId: string): Promise<({
        case: {
            caseType: import("@prisma/client").$Enums.CaseType;
            caseNumber: string;
            status: import("@prisma/client").$Enums.CaseStatus;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        caseId: string;
        language: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
