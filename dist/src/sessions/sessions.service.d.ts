import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { AuditService } from '../audit/audit.service';
import { CreateSessionDto } from './dto/session.dto';
export declare class SessionsService {
    private readonly prisma;
    private readonly ai;
    private readonly audit;
    constructor(prisma: PrismaService, ai: AiService, audit: AuditService);
    create(userId: string, dto: CreateSessionDto): Promise<any>;
    findOne(id: string): Promise<any>;
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
    close(sessionId: string): Promise<any>;
    findByUser(userId: string): Promise<any>;
}
