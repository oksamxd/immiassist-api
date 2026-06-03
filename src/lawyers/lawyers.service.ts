import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LawyersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.lawyer.findMany({
      include: { user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } } },
      orderBy: [{ rating: 'desc' }, { casesHandled: 'desc' }],
    });
  }

  async findAvailable() {
    return this.prisma.lawyer.findMany({
      where: { availabilityStatus: true },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: [{ rating: 'desc' }],
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.lawyer.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
  }

  async getProfile(userId: string) {
    const lawyer = await this.prisma.lawyer.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } } },
    });
    const cases = await this.prisma.case.count({ where: { assignedLawyerId: userId } });
    const activeCases = await this.prisma.case.count({
      where: { assignedLawyerId: userId, status: { notIn: ['CLOSED', 'RESOLVED'] } },
    });
    return { ...lawyer, stats: { totalCases: cases, activeCases } };
  }

  async updateAvailability(userId: string, available: boolean) {
    return this.prisma.lawyer.update({
      where: { userId },
      data: { availabilityStatus: available },
    });
  }

  async updateProfile(userId: string, dto: any) {
    return this.prisma.lawyer.update({
      where: { userId },
      data: {
        specialization: dto.specialization,
        location: dto.location,
        languages: dto.languages,
      },
    });
  }
}
