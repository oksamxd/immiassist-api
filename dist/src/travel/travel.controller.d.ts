import { TravelService } from './travel.service';
import { CreateTravelPlanDto } from './dto/travel.dto';
export declare class TravelController {
    private readonly travelService;
    constructor(travelService: TravelService);
    create(req: any, dto: CreateTravelPlanDto): Promise<{
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
        prepPack: import("@prisma/client/runtime/library").JsonValue | null;
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
        prepPack: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    generatePrepPack(req: any, id: string): Promise<{
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
        prepPack: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
