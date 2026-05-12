import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class WorkflowService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    getValidTransitions(currentStatus: string): string[];
    transition(caseId: string, newStatus: string, actorId?: string, remarks?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        caseNumber: string;
        caseType: import("@prisma/client").$Enums.CaseType;
        status: import("@prisma/client").$Enums.CaseStatus;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        assignedSupportId: string | null;
        assignedLawyerId: string | null;
        travelPlanId: string | null;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/client").JsonValue | null;
        closedAt: Date | null;
    }>;
}
