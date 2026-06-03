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
        visaType: string | null;
        visaExpiry: Date | null;
        employerOrUniversity: string | null;
        preferredLanguage: string;
        currentLocation: string | null;
        emergencyContact: string | null;
        userId: string;
    }) | null>;
    updateProfile(req: any, dto: any): Promise<{
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
