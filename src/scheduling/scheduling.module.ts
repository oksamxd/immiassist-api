import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [SchedulingService, PrismaService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
