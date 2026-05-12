import { PrismaService } from '../prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        caseId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: string;
        title: string;
        message: string;
        channel: import("@prisma/client").$Enums.DeliveryChannel;
        sentAt: Date | null;
        readAt: Date | null;
    }[]>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        caseId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: string;
        title: string;
        message: string;
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
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        caseId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: string;
        title: string;
        message: string;
        channel: import("@prisma/client").$Enums.DeliveryChannel;
        sentAt: Date | null;
        readAt: Date | null;
    }>;
}
