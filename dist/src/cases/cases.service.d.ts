import { PrismaService } from '../prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';
import { CreateCaseDto } from './dto/case.dto';
export declare class CasesService {
    private readonly prisma;
    private readonly workflow;
    private readonly audit;
    constructor(prisma: PrismaService, workflow: WorkflowService, audit: AuditService);
    private generateCaseNumber;
    create(userId: string, dto: CreateCaseDto): Promise<any>;
    findAllByUser(userId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    updateStatus(caseId: string, newStatus: string, actorId: string, remarks?: string): Promise<any>;
}
