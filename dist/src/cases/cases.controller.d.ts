import { CasesService } from './cases.service';
export declare class CasesController {
    private readonly casesService;
    constructor(casesService: CasesService);
    create(req: any, dto: any): Promise<{
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
            title: string;
            description: string | null;
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
            actorType: string;
            actorId: string | null;
            caseId: string;
        }[];
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
    }>;
    findMyCases(req: any): Promise<({
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
            profile: {
                passportNumber: string | null;
                nationality: string | null;
                countryOfResidence: string | null;
                visaType: string | null;
                preferredLanguage: string;
                emergencyContact: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currentLocation: string | null;
                travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
                userId: string;
            } | null;
            id: string;
            email: string;
            name: string;
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
            title: string;
            description: string | null;
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
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
    })[]> | Promise<({
        member: {
            profile: {
                passportNumber: string | null;
                nationality: string | null;
                countryOfResidence: string | null;
                visaType: string | null;
                preferredLanguage: string;
                emergencyContact: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currentLocation: string | null;
                travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
                userId: string;
            } | null;
            id: string;
            email: string;
            name: string;
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
            title: string;
            description: string | null;
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
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
    })[]> | Promise<({
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
    })[]> | Promise<({
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
            title: string;
            description: string | null;
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
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
    })[]>;
    findOne(id: string): Promise<{
        validTransitions: string[];
        sessions: {
            language: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            aiContext: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string;
            messages: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        notifications: {
            message: string;
            type: string;
            title: string;
            id: string;
            createdAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.NotificationStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            caseId: string | null;
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
            profile: {
                passportNumber: string | null;
                nationality: string | null;
                countryOfResidence: string | null;
                visaType: string | null;
                preferredLanguage: string;
                emergencyContact: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currentLocation: string | null;
                travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
                userId: string;
            } | null;
            id: string;
            email: string;
            name: string;
            phone: string | null;
        };
        assignedLawyer: {
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
            id: string;
            email: string;
            name: string;
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
            title: string;
            description: string | null;
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import("@prisma/client").$Enums.EventType;
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
    }>;
    updateStatus(id: string, body: any, req: any): Promise<{
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
    }>;
    update(id: string, dto: any, req: any): Promise<{
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
    }>;
    startTenMinuteMode(id: string, req: any): Promise<{
        success: boolean;
        plan: any;
    }>;
    triggerAirportLive(id: string, body: any, req: any): Promise<{
        success: boolean;
        risk: any;
    }>;
}
