import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CreateUserDto, LoginDto, UpdateProfileDto } from './dto/user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtStrategy,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async register(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: this.hashPassword(dto.password),
        phone: dto.phone,
        role: 'MEMBER',
      },
    });

    // Create empty member profile
    await this.prisma.memberProfile.create({
      data: { userId: user.id },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.passwordHash !== this.hashPassword(dto.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile: user.profile,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};
    if (dto.passportNumber !== undefined) data.passportNumber = dto.passportNumber;
    if (dto.nationality !== undefined) data.nationality = dto.nationality;
    if (dto.visaType !== undefined) data.visaType = dto.visaType;
    if (dto.visaExpiry !== undefined) data.visaExpiry = new Date(dto.visaExpiry);
    if (dto.employerOrUniversity !== undefined) data.employerOrUniversity = dto.employerOrUniversity;
    if (dto.portOfEntry !== undefined) data.portOfEntry = dto.portOfEntry;
    if (dto.preferredLanguage !== undefined) data.preferredLanguage = dto.preferredLanguage;
    if (dto.emergencyContact !== undefined) data.emergencyContact = dto.emergencyContact;

    return this.prisma.memberProfile.update({
      where: { userId },
      data,
    });
  }

  async getOnboardingStatus(userId: string) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    const documents = await this.prisma.document.findMany({
      where: { case: { userId } },
      select: { type: true },
    });

    const uploadedTypes = documents.map((d) => d.type);
    return {
      profileComplete: !!(profile?.passportNumber && profile?.nationality && profile?.visaType),
      documents: {
        PASSPORT: uploadedTypes.includes('PASSPORT'),
        VISA: uploadedTypes.includes('VISA'),
        I797: uploadedTypes.includes('I797'),
        I20: uploadedTypes.includes('I20'),
        EAD: uploadedTypes.includes('EAD'),
      },
      profile: {
        passportNumber: !!profile?.passportNumber,
        nationality: !!profile?.nationality,
        visaType: !!profile?.visaType,
        visaExpiry: !!profile?.visaExpiry,
        employerOrUniversity: !!profile?.employerOrUniversity,
      },
    };
  }
}
