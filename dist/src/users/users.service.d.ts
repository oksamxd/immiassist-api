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
            userId: string;
            portOfEntry: string | null;
            visaType: string | null;
            passportNumber: string | null;
            nationality: string | null;
            visaExpiry: Date | null;
            employerOrUniversity: string | null;
            preferredLanguage: string;
            emergencyContact: string | null;
        } | null;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        portOfEntry: string | null;
        visaType: string | null;
        passportNumber: string | null;
        nationality: string | null;
        visaExpiry: Date | null;
        employerOrUniversity: string | null;
        preferredLanguage: string;
        emergencyContact: string | null;
    }>;
    getOnboardingStatus(userId: string): Promise<{
        profileComplete: boolean;
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
            visaType: boolean;
            visaExpiry: boolean;
            employerOrUniversity: boolean;
        };
    }>;
}
