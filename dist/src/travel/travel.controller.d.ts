import { TravelService } from './travel.service';
import { CreateTravelPlanDto } from './dto/travel.dto';
export declare class TravelController {
    private readonly travelService;
    constructor(travelService: TravelService);
    create(req: any, dto: CreateTravelPlanDto): Promise<any>;
    findByCase(caseId: string): Promise<any>;
    generatePrepPack(req: any, id: string): Promise<any>;
}
