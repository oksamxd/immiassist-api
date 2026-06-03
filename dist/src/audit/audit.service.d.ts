import { PrismaService } from '../prisma.service';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(params: {
        actorId?: string;
        actorType?: string;
        action: string;
        entityType: string;
        entityId: string;
        payload?: any;
    }): Promise<any>;
}
