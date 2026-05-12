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
    }): Promise<{
        id: string;
        createdAt: Date;
        actorType: string;
        action: string;
        entityType: string;
        entityId: string;
        payload: import("@prisma/client/runtime/client").JsonValue | null;
        actorId: string | null;
    }>;
}
