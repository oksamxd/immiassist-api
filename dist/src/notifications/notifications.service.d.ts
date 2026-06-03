import { PrismaService } from '../prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUser(userId: string): Promise<any>;
    markAsRead(id: string): Promise<any>;
    getUnreadCount(userId: string): Promise<any>;
    create(params: {
        userId: string;
        caseId?: string;
        type: string;
        title: string;
        message: string;
    }): Promise<any>;
}
