import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class WorkflowService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    getValidTransitions(currentStatus: string): string[];
    transition(caseId: string, newStatus: string, actorId?: string, remarks?: string): Promise<any>;
}
