import { PrismaService } from '../prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';
export interface CreateCaseDto {
    caseType: string;
    summary?: string;
    priority?: string;
    visaCategory?: string;
    destinationCountry?: string;
    issueType?: string;
    notes?: string;
}
export interface UpdateCaseDto {
    summary?: string;
    priority?: string;
    riskLevel?: string;
    notes?: string;
}
export declare class CasesService {
    private readonly prisma;
    private readonly workflow;
    private readonly audit;
    constructor(prisma: PrismaService, workflow: WorkflowService, audit: AuditService);
    private generateCaseNumber;
    create(userId: string, dto: CreateCaseDto): Promise<{
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
            actorType: string;
            actorId: string | null;
            caseId: string;
        }[];
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
    }>;
    findAllByUser(userId: string): Promise<({
        appointments: {
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
        }[];
        courtDates: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            status: import("@prisma/client").$Enums.CourtDateStatus;
            notes: string | null;
            caseId: string;
            lawyerId: string;
            date: Date;
        }[];
        assignedLawyer: {
            id: string;
            name: string;
            profileImage: string | null;
        } | null;
        assignedAssociate: {
            id: string;
            name: string;
        } | null;
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
            actorType: string;
            actorId: string | null;
            caseId: string;
        }[];
        documents: {
            id: string;
            documentType: import("@prisma/client").$Enums.DocumentType;
            verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
        }[];
        _count: {
            events: number;
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
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
    })[]>;
    findAllByLawyer(lawyerUserId: string): Promise<({
        appointments: {
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
        }[];
        courtDates: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            status: import("@prisma/client").$Enums.CourtDateStatus;
            notes: string | null;
            caseId: string;
            lawyerId: string;
            date: Date;
        }[];
        member: {
            id: string;
            email: string;
            name: string;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                nationality: string | null;
                passportNumber: string | null;
                visaType: string | null;
                visaExpiry: Date | null;
                employerOrUniversity: string | null;
                preferredLanguage: string;
                currentLocation: string | null;
                emergencyContact: string | null;
                userId: string;
            } | null;
        };
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
            actorType: string;
            actorId: string | null;
            caseId: string;
        }[];
        documents: {
            id: string;
            createdAt: Date;
            notes: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
            uploadedBy: string | null;
            documentType: import("@prisma/client").$Enums.DocumentType;
            fileUrl: string;
            fileName: string | null;
            mimeType: string | null;
            verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
            aiExtracted: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        _count: {
            events: number;
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
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
    })[]>;
    findAllByAssociate(associateUserId: string): Promise<({
        member: {
            id: string;
            email: string;
            name: string;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                nationality: string | null;
                passportNumber: string | null;
                visaType: string | null;
                visaExpiry: Date | null;
                employerOrUniversity: string | null;
                preferredLanguage: string;
                currentLocation: string | null;
                emergencyContact: string | null;
                userId: string;
            } | null;
        };
        assignedLawyer: {
            id: string;
            name: string;
        } | null;
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
            actorType: string;
            actorId: string | null;
            caseId: string;
        }[];
        documents: {
            id: string;
            createdAt: Date;
            notes: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
            uploadedBy: string | null;
            documentType: import("@prisma/client").$Enums.DocumentType;
            fileUrl: string;
            fileName: string | null;
            mimeType: string | null;
            verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
            aiExtracted: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        _count: {
            events: number;
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
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
    })[]>;
    findAll(): Promise<({
        member: {
            id: string;
            email: string;
            name: string;
        };
        assignedLawyer: {
            id: string;
            name: string;
        } | null;
        assignedAssociate: {
            id: string;
            name: string;
        } | null;
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
        } | null;
        _count: {
            events: number;
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
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
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
            aiContext: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
            messages: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        notifications: {
            id: string;
            createdAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.NotificationStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            caseId: string | null;
            type: string;
            message: string;
            channel: import("@prisma/client").$Enums.DeliveryChannel;
            sentAt: Date | null;
            readAt: Date | null;
        }[];
        appointments: ({
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
        })[];
        courtDates: ({
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
        })[];
        member: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                nationality: string | null;
                passportNumber: string | null;
                visaType: string | null;
                visaExpiry: Date | null;
                employerOrUniversity: string | null;
                preferredLanguage: string;
                currentLocation: string | null;
                emergencyContact: string | null;
                userId: string;
            } | null;
        };
        assignedLawyer: {
            id: string;
            email: string;
            name: string;
            lawyer: {
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
            } | null;
        } | null;
        assignedAssociate: {
            id: string;
            email: string;
            name: string;
            legalAssociate: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                languages: string[];
                availabilityStatus: boolean;
                activeCaseCount: number;
                userId: string;
            } | null;
        } | null;
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
            actorType: string;
            actorId: string | null;
            caseId: string;
        }[];
        documents: {
            id: string;
            createdAt: Date;
            notes: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
            uploadedBy: string | null;
            documentType: import("@prisma/client").$Enums.DocumentType;
            fileUrl: string;
            fileName: string | null;
            mimeType: string | null;
            verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
            aiExtracted: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        statusHistory: {
            id: string;
            createdAt: Date;
            actorId: string | null;
            caseId: string;
            oldStatus: import("@prisma/client").$Enums.CaseStatus | null;
            newStatus: import("@prisma/client").$Enums.CaseStatus;
            remarks: string | null;
        }[];
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
    }>;
    updateStatus(caseId: string, newStatus: string, actorId: string, remarks?: string): Promise<{
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
    }>;
    update(caseId: string, dto: UpdateCaseDto, actorId: string): Promise<{
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
    }>;
}
