import { LegalAssociatesService } from './legal-associates.service';
export declare class LegalAssociatesController {
    private readonly legalAssociatesService;
    constructor(legalAssociatesService: LegalAssociatesService);
    findAll(): Promise<({
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
        languages: string[];
        availabilityStatus: boolean;
        activeCaseCount: number;
        userId: string;
    })[]>;
    findAvailable(): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        languages: string[];
        availabilityStatus: boolean;
        activeCaseCount: number;
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
        } | undefined;
        id?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        languages?: string[] | undefined;
        availabilityStatus?: boolean | undefined;
        activeCaseCount?: number | undefined;
        userId?: string | undefined;
    }>;
    updateAvailability(req: any, available: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        languages: string[];
        availabilityStatus: boolean;
        activeCaseCount: number;
        userId: string;
    }>;
}
