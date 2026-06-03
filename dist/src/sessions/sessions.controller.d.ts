import { SessionsService } from './sessions.service';
import { CreateSessionDto, SendMessageDto } from './dto/session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(req: any, dto: CreateSessionDto): Promise<any>;
    findAll(req: any): Promise<any>;
    findOne(id: string): Promise<any>;
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
    close(id: string): Promise<any>;
}
