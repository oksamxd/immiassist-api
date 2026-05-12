import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTravelPlanDto } from './dto/travel.dto';
export declare class TravelService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(userId: string, dto: CreateTravelPlanDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        caseId: string;
        fromLocation: string;
        toLocation: string;
        airline: string | null;
        flightNumber: string | null;
        portOfEntry: string;
        arrivalDatetime: Date;
        visaType: string;
        purposeOfTravel: string | null;
        prepPack: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findByCase(caseId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        caseId: string;
        fromLocation: string;
        toLocation: string;
        airline: string | null;
        flightNumber: string | null;
        portOfEntry: string;
        arrivalDatetime: Date;
        visaType: string;
        purposeOfTravel: string | null;
        prepPack: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    generatePrepPack(planId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        caseId: string;
        fromLocation: string;
        toLocation: string;
        airline: string | null;
        flightNumber: string | null;
        portOfEntry: string;
        arrivalDatetime: Date;
        visaType: string;
        purposeOfTravel: string | null;
        prepPack: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
