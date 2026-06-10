import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { AuditService } from '../audit/audit.service';
import { CreateSessionDto } from './dto/session.dto';
export declare class SessionsService {
    private readonly prisma;
    private readonly ai;
    private readonly audit;
    constructor(prisma: PrismaService, ai: AiService, audit: AuditService);
    private getRequiredDocs;
    private buildOnboardingContext;
    create(userId: string, dto: CreateSessionDto): Promise<{
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    } | {
        messages: {
            role: string;
            content: string;
            timestamp: string;
        }[];
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
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
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findByUser(userId: string): Promise<({
        case: {
            caseNumber: string;
            caseType: import("@prisma/client").$Enums.CaseType;
            status: import("@prisma/client").$Enums.CaseStatus;
        };
    } & {
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findByCaseForLegalTeam(caseId: string): Promise<({
        case: {
            caseNumber: string;
            caseType: import("@prisma/client").$Enums.CaseType;
            status: import("@prisma/client").$Enums.CaseStatus;
        };
    } & {
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
