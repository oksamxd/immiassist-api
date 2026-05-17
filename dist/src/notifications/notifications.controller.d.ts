import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        caseId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        type: string;
        title: string;
        message: string;
        channel: import("@prisma/client").$Enums.DeliveryChannel;
        sentAt: Date | null;
        readAt: Date | null;
    }[]>;
    unreadCount(req: any): Promise<number>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        caseId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        type: string;
        title: string;
        message: string;
        channel: import("@prisma/client").$Enums.DeliveryChannel;
        sentAt: Date | null;
        readAt: Date | null;
    }>;
}
