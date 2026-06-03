import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MemberProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.memberProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });
  }

  async updateProfile(userId: string, dto: any) {
    return this.prisma.memberProfile.upsert({
      where: { userId },
      update: dto,
      create: { ...dto, userId },
    });
  }
}
