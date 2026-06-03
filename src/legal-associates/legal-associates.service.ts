import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LegalAssociatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.legalAssociate.findMany({
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
  }

  async findAvailable() {
    return this.prisma.legalAssociate.findMany({
      where: { availabilityStatus: true },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { activeCaseCount: 'asc' },
    });
  }

  async getProfile(userId: string) {
    const associate = await this.prisma.legalAssociate.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
    const cases = await this.prisma.case.count({ where: { assignedLegalAssociateId: userId } });
    const activeCases = await this.prisma.case.count({
      where: { assignedLegalAssociateId: userId, status: { notIn: ['CLOSED', 'RESOLVED'] } },
    });
    return { ...associate, stats: { totalCases: cases, activeCases } };
  }

  async updateAvailability(userId: string, available: boolean) {
    return this.prisma.legalAssociate.update({
      where: { userId },
      data: { availabilityStatus: available },
    });
  }
}
