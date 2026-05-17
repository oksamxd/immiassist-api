import { SessionsService } from './sessions.service';
import { CreateSessionDto, SendMessageDto } from './dto/session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(req: any, dto: CreateSessionDto): Promise<{
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
        steps: import("@prisma/client/runtime/library").JsonValue | null;
        voiceScript: string | null;
    }>;
    findAll(req: any): Promise<({
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
        steps: import("@prisma/client/runtime/library").JsonValue | null;
        voiceScript: string | null;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        caseId: string;
        sessionType: import("@prisma/client").$Enums.SessionType;
        steps: import("@prisma/client/runtime/library").JsonValue | null;
        voiceScript: string | null;
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
        messageCount: number;
    }>;
    close(id: string): Promise<{
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        caseId: string;
        sessionType: import("@prisma/client").$Enums.SessionType;
        steps: import("@prisma/client/runtime/library").JsonValue | null;
        voiceScript: string | null;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
