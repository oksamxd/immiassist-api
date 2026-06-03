import { TimelineService } from './timeline.service';
export declare class TimelineController {
    private readonly timelineService;
    constructor(timelineService: TimelineService);
    getTimeline(caseId: string): Promise<{
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
