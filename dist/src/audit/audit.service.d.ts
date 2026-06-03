import { PrismaService } from '../prisma.service';
export interface AuditLogDto {
    actorId?: string;
    actorType?: string;
    action: string;
    entityType: string;
    entityId: string;
    payload?: any;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(dto: AuditLogDto): Promise<{
        id: string;
        createdAt: Date;
        actorType: string;
        actorId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
