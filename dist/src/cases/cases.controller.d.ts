import { CasesService } from './cases.service';
export declare class CasesController {
    private readonly casesService;
    constructor(casesService: CasesService);
    create(req: any, dto: any): Promise<{
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            notes: string | null;
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
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
    }>;
    findMyCases(req: any): Promise<({
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
                userId: string;
                currentLocation: string | null;
                travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            id: string;
            name: string;
            email: string;
        };
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            notes: string | null;
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
        appointments: {
            id: string;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            caseId: string;
            scheduledAt: Date;
            lawyerId: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            meetingLink: string | null;
        }[];
        courtDates: {
            id: string;
            status: import("@prisma/client").$Enums.CourtDateStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            caseId: string;
            date: Date;
            lawyerId: string;
            location: string | null;
        }[];
        _count: {
            events: number;
            documents: number;
        };
    } & {
        caseType: import("@prisma/client").$Enums.CaseType;
        caseNumber: string;
        id: string;
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
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
                userId: string;
                currentLocation: string | null;
                travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            id: string;
            name: string;
            email: string;
        };
        assignedLawyer: {
            id: string;
            name: string;
        } | null;
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            notes: string | null;
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
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
    })[]> | Promise<({
        member: {
            id: string;
            name: string;
            email: string;
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
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            notes: string | null;
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
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
    })[]> | Promise<({
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
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            notes: string | null;
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
        appointments: {
            id: string;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            caseId: string;
            scheduledAt: Date;
            lawyerId: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            meetingLink: string | null;
        }[];
        courtDates: {
            id: string;
            status: import("@prisma/client").$Enums.CourtDateStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            caseId: string;
            date: Date;
            lawyerId: string;
            location: string | null;
        }[];
        _count: {
            events: number;
            documents: number;
        };
    } & {
        caseType: import("@prisma/client").$Enums.CaseType;
        caseNumber: string;
        id: string;
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        validTransitions: string[];
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
                userId: string;
                currentLocation: string | null;
                travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            id: string;
            name: string;
            email: string;
            phone: string | null;
        };
        assignedLawyer: {
            lawyer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                location: string | null;
                specialization: string[];
                languages: string[];
                barNumber: string | null;
                availabilityStatus: boolean;
                rating: number;
                casesHandled: number;
            } | null;
            id: string;
            name: string;
            email: string;
        } | null;
        assignedAssociate: {
            id: string;
            name: string;
            email: string;
            legalAssociate: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                languages: string[];
                availabilityStatus: boolean;
                activeCaseCount: number;
            } | null;
        } | null;
        detail: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            issueType: string | null;
            visaCategory: string | null;
            destinationCountry: string | null;
            notes: string | null;
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
        sessions: {
            id: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            aiContext: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            caseId: string;
            language: string;
            messages: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        notifications: {
            message: string;
            type: string;
            title: string;
            id: string;
            status: import("@prisma/client").$Enums.NotificationStatus;
            createdAt: Date;
            userId: string;
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
                userId: string;
                location: string | null;
                specialization: string[];
                languages: string[];
                barNumber: string | null;
                availabilityStatus: boolean;
                rating: number;
                casesHandled: number;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            caseId: string;
            scheduledAt: Date;
            lawyerId: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
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
                userId: string;
                location: string | null;
                specialization: string[];
                languages: string[];
                barNumber: string | null;
                availabilityStatus: boolean;
                rating: number;
                casesHandled: number;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.CourtDateStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            caseId: string;
            date: Date;
            lawyerId: string;
            location: string | null;
        })[];
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
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
    }>;
    updateStatus(id: string, body: any, req: any): Promise<{
        caseType: import("@prisma/client").$Enums.CaseType;
        caseNumber: string;
        id: string;
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
    }>;
    update(id: string, dto: any, req: any): Promise<{
        caseType: import("@prisma/client").$Enums.CaseType;
        caseNumber: string;
        id: string;
        status: import("@prisma/client").$Enums.CaseStatus;
        priority: import("@prisma/client").$Enums.Priority;
        riskLevel: import("@prisma/client").$Enums.RiskLevel;
        summary: string | null;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedLawyerId: string | null;
        assignedLegalAssociateId: string | null;
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
