import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkflowService } from '../workflow/workflow.service';
export declare class AssignmentService {
    private readonly prisma;
    private readonly audit;
    private readonly workflow;
    constructor(prisma: PrismaService, audit: AuditService, workflow: WorkflowService);
    assignSupport(caseId: string, actorId?: string): Promise<{
        caseId: string;
        agent: {
            id: string;
            name: string;
        };
    }>;
    alertLawyer(caseId: string, actorId?: string): Promise<{
        caseId: string;
        lawyer: {
            id: string;
            name: string;
        };
    }>;
    lawyerAccept(caseId: string, actorId: string): Promise<{
        caseId: string;
        accepted: boolean;
    }>;
}
