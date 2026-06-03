import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(req: any): Promise<{
        error: string;
        stats?: undefined;
        cases?: undefined;
        upcomingAppointments?: undefined;
    } | {
        stats: {
            totalCases: number;
            activeCases: number;
            upcomingAppointments: number;
        };
        cases: {
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
        }[];
        upcomingAppointments: ({
            case: {
                caseNumber: string;
                member: {
                    name: string;
                };
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
        error?: undefined;
    }> | Promise<{
        stats: {
            totalCases: number;
            activeCases: number;
            needsReview: number;
        };
        cases: ({
            member: {
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
        })[];
    }> | Promise<{
        stats: {
            totalCases: number;
            activeCases: number;
            unreadNotifications: number;
        };
        recentCases: ({
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
        })[];
        recentDocuments: {
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
    }>;
}
