import { PrismaService } from '../prisma.service';
export declare class MemberProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<({
        user: {
            email: string;
            name: string;
            phone: string | null;
        };
    } & {
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
    }) | null>;
    updateProfile(userId: string, dto: any): Promise<{
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
    }>;
}
