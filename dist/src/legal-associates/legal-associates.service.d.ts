import { PrismaService } from '../prisma.service';
export declare class LegalAssociatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    getProfile(userId: string): Promise<{
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
    updateAvailability(userId: string, available: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        languages: string[];
        availabilityStatus: boolean;
        activeCaseCount: number;
        userId: string;
    }>;
}
