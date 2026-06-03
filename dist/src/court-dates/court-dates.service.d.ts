import { PrismaService } from '../prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';
export declare class CourtDatesService {
    private readonly prisma;
    private readonly workflow;
    private readonly audit;
    constructor(prisma: PrismaService, workflow: WorkflowService, audit: AuditService);
    create(caseId: string, lawyerId: string, dto: any, actorId: string): Promise<{
        lawyer: {
            user: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            specialization: string[];
            location: string | null;
            languages: string[];
            barNumber: string | null;
            availabilityStatus: boolean;
            rating: number;
            casesHandled: number;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        status: import("@prisma/client").$Enums.CourtDateStatus;
        notes: string | null;
        caseId: string;
        lawyerId: string;
        date: Date;
    }>;
    findByCase(caseId: string): Promise<({
        lawyer: {
            user: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            specialization: string[];
            location: string | null;
            languages: string[];
            barNumber: string | null;
            availabilityStatus: boolean;
            rating: number;
            casesHandled: number;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        status: import("@prisma/client").$Enums.CourtDateStatus;
        notes: string | null;
        caseId: string;
        lawyerId: string;
        date: Date;
    })[]>;
    findByLawyer(lawyerUserId: string): Promise<({
        case: {
            member: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            caseNumber: string;
            caseType: import("@prisma/client").$Enums.CaseType;
            status: import("@prisma/client").$Enums.CaseStatus;
            priority: import("@prisma/client").$Enums.Priority;
            riskLevel: import("@prisma/client").$Enums.RiskLevel;
            assignedLawyerId: string | null;
            assignedLegalAssociateId: string | null;
            summary: string | null;
            aiContext: import("@prisma/client/runtime/library").JsonValue | null;
            closedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        status: import("@prisma/client").$Enums.CourtDateStatus;
        notes: string | null;
        caseId: string;
        lawyerId: string;
        date: Date;
    })[]>;
    updateStatus(id: string, status: string, actorId: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        status: import("@prisma/client").$Enums.CourtDateStatus;
        notes: string | null;
        caseId: string;
        lawyerId: string;
        date: Date;
    }>;
}
