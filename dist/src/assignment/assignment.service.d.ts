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
            id: any;
            name: any;
        };
    }>;
    alertLawyer(caseId: string, actorId?: string): Promise<{
        caseId: string;
        lawyer: {
            id: any;
            name: any;
        };
    }>;
    lawyerAccept(caseId: string, actorId: string): Promise<{
        caseId: string;
        accepted: boolean;
    }>;
}
