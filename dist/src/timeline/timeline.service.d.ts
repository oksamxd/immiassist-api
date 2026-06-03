import { PrismaService } from '../prisma.service';
export declare class TimelineService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCaseTimeline(caseId: string): Promise<{
        caseId: string;
        totalEvents: number;
        timeline: Record<string, any[]>;
        events: ({
            case: {
                caseNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
            actorType: string;
            actorId: string | null;
            caseId: string;
        })[];
    }>;
}
