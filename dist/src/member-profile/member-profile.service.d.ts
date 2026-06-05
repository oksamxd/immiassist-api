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
        countryOfResidence: string | null;
        visaType: string | null;
        preferredLanguage: string;
        currentLocation: string | null;
        emergencyContact: string | null;
        travelHistory: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    }) | null>;
    updateProfile(userId: string, dto: any): Promise<{
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
    }>;
}
