import { MemberProfileService } from './member-profile.service';
export declare class MemberProfileController {
    private readonly memberProfileService;
    constructor(memberProfileService: MemberProfileService);
    getProfile(req: any): Promise<({
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
    updateProfile(req: any, dto: any): Promise<{
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
