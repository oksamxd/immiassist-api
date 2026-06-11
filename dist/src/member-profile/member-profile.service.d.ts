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
    }) | null>;
    updateProfile(userId: string, dto: any): Promise<{
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
    }>;
}
