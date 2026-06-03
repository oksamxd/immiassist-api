import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTravelPlanDto } from './dto/travel.dto';
export declare class TravelService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(userId: string, dto: CreateTravelPlanDto): Promise<any>;
    findByCase(caseId: string): Promise<any>;
    generatePrepPack(planId: string, userId: string): Promise<any>;
}
