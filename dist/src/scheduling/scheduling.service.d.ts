import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class SchedulingService implements OnModuleInit {
    private readonly prisma;
    private readonly ai;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, ai: AiService, notifications: NotificationsService);
    onModuleInit(): void;
    sendAppointmentReminders(): Promise<void>;
    sendCourtDateReminders(): Promise<void>;
    nudgePendingDocuments(): Promise<void>;
    generateWeeklySummaries(): Promise<void>;
}
