import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<{
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
    unreadCount(req: any): Promise<number>;
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
}
