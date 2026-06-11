import { PrismaService } from '../prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUser(userId: string): Promise<{
        message: string;
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string | null;
        channel: import("@prisma/client").$Enums.DeliveryChannel;
        sentAt: Date | null;
        readAt: Date | null;
    }[]>;
    markAsRead(id: string): Promise<{
        message: string;
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string | null;
        channel: import("@prisma/client").$Enums.DeliveryChannel;
        sentAt: Date | null;
        readAt: Date | null;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    create(params: {
        userId: string;
        caseId?: string;
        type: string;
        title: string;
        message: string;
    }): Promise<{
        message: string;
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string | null;
        channel: import("@prisma/client").$Enums.DeliveryChannel;
        sentAt: Date | null;
        readAt: Date | null;
    }>;
}
