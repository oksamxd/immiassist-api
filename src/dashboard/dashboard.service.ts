import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMemberDashboard(userId: string) {
    const cases = await this.prisma.case.findMany({
      where: { userId },
      include: {
        events: { orderBy: { createdAt: 'desc' }, take: 1 },
        appointments: { where: { scheduledAt: { gte: new Date() } }, orderBy: { scheduledAt: 'asc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const documents = await this.prisma.document.findMany({
      where: { case: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const unreadNotifications = await this.prisma.notification.count({
      where: { userId, status: 'PENDING' },
    });

    return {
      stats: {
        totalCases: cases.length,
        activeCases: cases.filter((c) => !['CLOSED', 'RESOLVED'].includes(c.status)).length,
        unreadNotifications,
      },
      recentCases: cases,
      recentDocuments: documents,
    };
  }

  async getLawyerDashboard(lawyerUserId: string) {
    const lawyer = await this.prisma.lawyer.findUnique({ where: { userId: lawyerUserId } });
    if (!lawyer) return { error: 'Lawyer not found' };

    const cases = await this.prisma.case.findMany({
      where: { assignedLawyerId: lawyerUserId },
      orderBy: { updatedAt: 'desc' },
    });

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: { lawyerId: lawyer.id, scheduledAt: { gte: new Date() }, status: 'SCHEDULED' },
      include: { case: { select: { caseNumber: true, member: { select: { name: true } } } } },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    return {
      stats: {
        totalCases: cases.length,
        activeCases: cases.filter((c) => !['CLOSED', 'RESOLVED'].includes(c.status)).length,
        upcomingAppointments: upcomingAppointments.length,
      },
      cases,
      upcomingAppointments,
    };
  }

  async getAssociateDashboard(associateUserId: string) {
    const cases = await this.prisma.case.findMany({
      where: { assignedLegalAssociateId: associateUserId },
      include: { member: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      stats: {
        totalCases: cases.length,
        activeCases: cases.filter((c) => !['CLOSED', 'RESOLVED'].includes(c.status)).length,
        needsReview: cases.filter((c) => c.status === 'UNDER_REVIEW').length,
      },
      cases,
    };
  }
}
