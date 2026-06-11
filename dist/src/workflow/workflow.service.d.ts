import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class WorkflowService {
    private readonly prisma;
    private readonly audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    getValidTransitions(currentStatus: string): string[];
    transition(caseId: string, newStatus: string, actorId?: string, remarks?: string, forceTransition?: boolean): Promise<{
        caseType: import("@prisma/client").$Enums.CaseType;
        caseNumber: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
    }>;
    emitEvent(caseId: string, eventType: string, title: string, description?: string, actorId?: string, metadata?: any): Promise<{
        title: string;
        description: string | null;
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        eventType: import("@prisma/client").$Enums.EventType;
        actorType: string;
        actorId: string | null;
        caseId: string;
    }>;
}
