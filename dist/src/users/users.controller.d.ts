import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, UpdateProfileDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(dto: CreateUserDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        token: string;
        activeCases: {
            id: string;
            updatedAt: Date;
            caseNumber: string;
            caseType: import("@prisma/client").$Enums.CaseType;
            status: import("@prisma/client").$Enums.CaseStatus;
        }[];
    }>;
    getProfile(req: any, res: any): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nationality: string | null;
            passportNumber: string | null;
            countryOfResidence: string | null;
            visaType: string | null;
            preferredLanguage: string;
            currentLocation: string | null;
            emergencyContact: string | null;
            travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
        } | null;
        legalProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currentVisaStatus: string | null;
            visaExpiry: Date | null;
            immigrationHistory: import("@prisma/client/runtime/library").JsonValue | null;
            previousNotices: import("@prisma/client/runtime/library").JsonValue | null;
            previousDenials: import("@prisma/client/runtime/library").JsonValue | null;
            currentEmployer: string | null;
            university: string | null;
            dependents: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
        } | null;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nationality: string | null;
            passportNumber: string | null;
            countryOfResidence: string | null;
            visaType: string | null;
            preferredLanguage: string;
            currentLocation: string | null;
            emergencyContact: string | null;
            travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
        } | null;
        legalProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currentVisaStatus: string | null;
            visaExpiry: Date | null;
            immigrationHistory: import("@prisma/client/runtime/library").JsonValue | null;
            previousNotices: import("@prisma/client/runtime/library").JsonValue | null;
            previousDenials: import("@prisma/client/runtime/library").JsonValue | null;
            currentEmployer: string | null;
            university: string | null;
            dependents: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
        } | null;
    }>;
    getOnboardingStatus(req: any, res: any): Promise<{
        profileComplete: boolean;
        legalProfileComplete: boolean;
        documents: {
            PASSPORT: boolean;
            VISA: boolean;
            I797: boolean;
            I20: boolean;
            EAD: boolean;
        };
        profile: {
            passportNumber: boolean;
            nationality: boolean;
            countryOfResidence: boolean;
            visaType: boolean;
        };
        legalProfile: {
            currentVisaStatus: boolean;
            visaExpiry: boolean;
            currentEmployer: boolean;
        };
    }>;
    getActiveSession(req: any): Promise<({
        case: {
            id: string;
            caseNumber: string;
            caseType: import("@prisma/client").$Enums.CaseType;
            status: import("@prisma/client").$Enums.CaseStatus;
        };
    } & {
        id: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        aiContext: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        messages: import("@prisma/client/runtime/library").JsonValue | null;
    }) | null>;
}
