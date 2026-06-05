import { PrismaService } from '../prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CreateUserDto, LoginDto, UpdateProfileDto } from './dto/user.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtStrategy);
    private hashPassword;
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
    }>;
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
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
    getOnboardingStatus(userId: string): Promise<{
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
}
