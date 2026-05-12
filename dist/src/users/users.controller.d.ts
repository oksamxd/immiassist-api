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
    }>;
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
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
    getOnboardingStatus(req: any): Promise<{
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
