import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getCaseTimeline(caseId: string) {
    const events = await this.prisma.caseEvent.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
      include: {
        case: { select: { caseNumber: true } }
      }
    });

    const groupedEvents = events.reduce((acc, event) => {
      const date = event.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      caseId,
      totalEvents: events.length,
      timeline: groupedEvents,
      events,
    };
  }
}
