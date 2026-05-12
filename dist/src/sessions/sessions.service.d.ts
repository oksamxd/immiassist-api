import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { AuditService } from '../audit/audit.service';
import { CreateSessionDto } from './dto/session.dto';
export declare class SessionsService {
    private readonly prisma;
    private readonly ai;
    private readonly audit;
    constructor(prisma: PrismaService, ai: AiService, audit: AuditService);
    create(userId: string, dto: CreateSessionDto): Promise<{
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
        caseId: string;
        sessionType: import("@prisma/client").$Enums.SessionType;
        steps: import("@prisma/client/runtime/client").JsonValue | null;
        voiceScript: string | null;
    }>;
    findOne(id: string): Promise<{
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        caseId: string;
        sessionType: import("@prisma/client").$Enums.SessionType;
        steps: import("@prisma/client/runtime/client").JsonValue | null;
        voiceScript: string | null;
        messages: import("@prisma/client/runtime/client").JsonValue | null;
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
        messageCount: number;
    }>;
    close(sessionId: string): Promise<{
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        caseId: string;
        sessionType: import("@prisma/client").$Enums.SessionType;
        steps: import("@prisma/client/runtime/client").JsonValue | null;
        voiceScript: string | null;
        messages: import("@prisma/client/runtime/client").JsonValue | null;
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
        caseId: string;
        sessionType: import("@prisma/client").$Enums.SessionType;
        steps: import("@prisma/client/runtime/client").JsonValue | null;
        voiceScript: string | null;
        messages: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
}
