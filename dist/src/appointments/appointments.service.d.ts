import { PrismaService } from '../prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';
export declare class AppointmentsService {
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
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        caseId: string;
        lawyerId: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        scheduledAt: Date;
        meetingLink: string | null;
    }>;
    findByCase(caseId: string): Promise<({
        lawyer: {
            user: {
                email: string;
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
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        caseId: string;
        lawyerId: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        scheduledAt: Date;
        meetingLink: string | null;
    })[]>;
    findByLawyer(lawyerUserId: string): Promise<({
        case: {
            member: {
                id: string;
                email: string;
                name: string;
            };
        } & {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        caseId: string;
        lawyerId: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        scheduledAt: Date;
        meetingLink: string | null;
    })[]>;
    updateStatus(id: string, status: string, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        caseId: string;
        lawyerId: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        scheduledAt: Date;
        meetingLink: string | null;
    }>;
}
