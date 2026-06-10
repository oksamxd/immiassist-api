import { CourtDatesService } from './court-dates.service';
export declare class CourtDatesController {
    private readonly courtDatesService;
    constructor(courtDatesService: CourtDatesService);
    create(req: any, dto: any): Promise<{
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
    findByLawyer(req: any): Promise<({
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
    findUpcoming(req: any): Promise<({
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
        case: {
            caseNumber: string;
            caseType: import("@prisma/client").$Enums.CaseType;
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
    updateStatus(id: string, body: any, req: any): Promise<{
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
