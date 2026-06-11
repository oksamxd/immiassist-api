import { SessionsService } from './sessions.service';
import { CreateSessionDto, SendMessageDto } from './dto/session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(req: any, dto: CreateSessionDto): Promise<{
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
    findAll(req: any): Promise<({
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
    sendMessage(req: any, id: string, dto: SendMessageDto): Promise<{
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
    close(id: string): Promise<{
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
    sendLegalReply(caseId: string, body: {
        message: string;
    }, req: any): Promise<{
        success: boolean;
        message: {
            role: string;
            content: string;
            timestamp: string;
            actorId: string;
        };
    }>;
}
