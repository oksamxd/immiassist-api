import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseStatusDto } from './dto/case.dto';
export declare class CasesController {
    private readonly casesService;
    constructor(casesService: CasesService);
    create(req: any, dto: CreateCaseDto): Promise<{
        events: {
            id: string;
            createdAt: Date;
            actorType: string;
            actorId: string | null;
            caseId: string;
            eventType: import("@prisma/client").$Enums.EventType;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    } & {
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
    findAll(req: any): Promise<({
        travelPlan: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            caseId: string;
            fromLocation: string;
            toLocation: string;
            airline: string | null;
            flightNumber: string | null;
            portOfEntry: string;
            arrivalDatetime: Date;
            visaType: string;
            purposeOfTravel: string | null;
            prepPack: import("@prisma/client/runtime/client").JsonValue | null;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            actorType: string;
            actorId: string | null;
            caseId: string;
            eventType: import("@prisma/client").$Enums.EventType;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        _count: {
            sessions: number;
            documents: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        validTransitions: string[];
        sessions: {
            id: string;
            language: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            caseId: string;
            sessionType: import("@prisma/client").$Enums.SessionType;
            steps: import("@prisma/client/runtime/client").JsonValue | null;
            voiceScript: string | null;
            messages: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        notifications: {
            id: string;
            createdAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.NotificationStatus;
            caseId: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            type: string;
            title: string;
            message: string;
            channel: import("@prisma/client").$Enums.DeliveryChannel;
            sentAt: Date | null;
            readAt: Date | null;
        }[];
        travelPlan: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            caseId: string;
            fromLocation: string;
            toLocation: string;
            airline: string | null;
            flightNumber: string | null;
            portOfEntry: string;
            arrivalDatetime: Date;
            visaType: string;
            purposeOfTravel: string | null;
            prepPack: import("@prisma/client/runtime/client").JsonValue | null;
        } | null;
        lawyerAssignment: {
            id: string;
            createdAt: Date;
            caseId: string;
            lawyerId: string;
            alertedAt: Date;
            acceptedAt: Date | null;
            isAccepted: boolean;
            consultationAt: Date | null;
            notes: string | null;
        } | null;
        member: {
            id: string;
            email: string;
            name: string;
        };
        events: {
            id: string;
            createdAt: Date;
            actorType: string;
            actorId: string | null;
            caseId: string;
            eventType: import("@prisma/client").$Enums.EventType;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        documents: {
            id: string;
            createdAt: Date;
            caseId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            type: import("@prisma/client").$Enums.DocumentType;
            fileUrl: string;
            fileName: string | null;
            mimeType: string | null;
            aiExtracted: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        statusHistory: {
            id: string;
            createdAt: Date;
            oldStatus: import("@prisma/client").$Enums.CaseStatus | null;
            newStatus: import("@prisma/client").$Enums.CaseStatus;
            remarks: string | null;
            caseId: string;
        }[];
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
    updateStatus(req: any, id: string, dto: UpdateCaseStatusDto): Promise<{
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
