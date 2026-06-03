import { LawyersService } from './lawyers.service';
export declare class LawyersController {
    private readonly lawyersService;
    constructor(lawyersService: LawyersService);
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            profileImage: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialization: string[];
        location: string | null;
        languages: string[];
        barNumber: string | null;
        availabilityStatus: boolean;
        rating: number;
        casesHandled: number;
        userId: string;
    })[]>;
    findAvailable(): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialization: string[];
        location: string | null;
        languages: string[];
        barNumber: string | null;
        availabilityStatus: boolean;
        rating: number;
        casesHandled: number;
        userId: string;
    })[]>;
    getProfile(req: any): Promise<{
        stats: {
            totalCases: number;
            activeCases: number;
        };
        user?: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            profileImage: string | null;
        } | undefined;
        id?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        specialization?: string[] | undefined;
        location?: string | null | undefined;
        languages?: string[] | undefined;
        barNumber?: string | null | undefined;
        availabilityStatus?: boolean | undefined;
        rating?: number | undefined;
        casesHandled?: number | undefined;
        userId?: string | undefined;
    }>;
    updateAvailability(req: any, available: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialization: string[];
        location: string | null;
        languages: string[];
        barNumber: string | null;
        availabilityStatus: boolean;
        rating: number;
        casesHandled: number;
        userId: string;
    }>;
    updateProfile(req: any, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialization: string[];
        location: string | null;
        languages: string[];
        barNumber: string | null;
        availabilityStatus: boolean;
        rating: number;
        casesHandled: number;
        userId: string;
    }>;
}
