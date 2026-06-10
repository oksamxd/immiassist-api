import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, LoginDto, UpdateProfileDto } from './dto/user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtStrategy,
    private readonly audit: AuditService,
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

    // Create empty member profile & legal profile
    await this.prisma.memberProfile.create({ data: { userId: user.id } });
    await this.prisma.legalProfile.create({ data: { userId: user.id } });

    // Log registration event
    await this.audit.log({
      actorId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      payload: { email: user.email, name: user.name },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.passwordHash !== this.hashPassword(dto.password)) {
      // Log failed login attempt
      await this.audit.log({
        actorType: 'ANONYMOUS',
        action: 'LOGIN_FAILED',
        entityType: 'User',
        entityId: dto.email,
        payload: { email: dto.email, reason: 'Invalid credentials' },
      }).catch(() => {}); // don't throw if user doesn't exist
      throw new UnauthorizedException('Invalid email or password');
    }

    // Log successful login
    await this.audit.log({
      actorId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      payload: { email: user.email, role: user.role, loginAt: new Date().toISOString() },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });

    // Return user with their active cases summary for session resume
    const activeCases = await this.prisma.case.findMany({
      where: { userId: user.id, status: { notIn: ['CLOSED', 'RESOLVED'] } },
      select: { id: true, caseNumber: true, caseType: true, status: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
      activeCases,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, legalProfile: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile: user.profile,
      legalProfile: user.legalProfile,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const memberData: any = {};
    if (dto.passportNumber !== undefined) memberData.passportNumber = dto.passportNumber;
    if (dto.nationality !== undefined) memberData.nationality = dto.nationality;
    if (dto.visaType !== undefined) memberData.visaType = dto.visaType;
    if (dto.countryOfResidence !== undefined) memberData.countryOfResidence = dto.countryOfResidence;
    if (dto.preferredLanguage !== undefined) memberData.preferredLanguage = dto.preferredLanguage;
    if (dto.emergencyContact !== undefined) memberData.emergencyContact = dto.emergencyContact;
    if (dto.travelHistory !== undefined) memberData.travelHistory = dto.travelHistory;

    if (Object.keys(memberData).length > 0) {
      await this.prisma.memberProfile.upsert({
        where: { userId },
        update: memberData,
        create: { userId, ...memberData },
      });
    }

    const legalData: any = {};
    if (dto.currentVisaStatus !== undefined) legalData.currentVisaStatus = dto.currentVisaStatus;
    if (dto.visaExpiry !== undefined) legalData.visaExpiry = new Date(dto.visaExpiry);
    if (dto.immigrationHistory !== undefined) legalData.immigrationHistory = dto.immigrationHistory;
    if (dto.previousNotices !== undefined) legalData.previousNotices = dto.previousNotices;
    if (dto.previousDenials !== undefined) legalData.previousDenials = dto.previousDenials;
    if (dto.currentEmployer !== undefined) legalData.currentEmployer = dto.currentEmployer;
    if (dto.university !== undefined) legalData.university = dto.university;
    if (dto.dependents !== undefined) legalData.dependents = dto.dependents;

    if (Object.keys(legalData).length > 0) {
      await this.prisma.legalProfile.upsert({
        where: { userId },
        create: { userId, ...legalData },
        update: legalData,
      });
    }

    // Log profile update
    await this.audit.log({
      actorId: userId,
      action: 'PROFILE_UPDATED',
      entityType: 'User',
      entityId: userId,
      payload: { memberFields: Object.keys(memberData), legalFields: Object.keys(legalData) },
    });

    return this.getProfile(userId);
  }

  async getOnboardingStatus(userId: string) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    const legalProfile = await this.prisma.legalProfile.findUnique({ where: { userId } });
    const documents = await this.prisma.document.findMany({
      where: { case: { userId } },
      select: { documentType: true },
    });

    const uploadedTypes = documents.map((d: any) => d.documentType);
    const memberProfileComplete = !!(profile?.passportNumber?.trim() && profile?.nationality?.trim() && profile?.countryOfResidence?.trim() && profile?.visaType?.trim());
    const legalProfileComplete = !!(legalProfile?.currentVisaStatus?.trim() && legalProfile?.currentEmployer?.trim() && legalProfile?.visaExpiry);

    return {
      profileComplete: memberProfileComplete,
      legalProfileComplete,
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
        countryOfResidence: !!profile?.countryOfResidence,
        visaType: !!profile?.visaType,
      },
      legalProfile: {
        currentVisaStatus: !!legalProfile?.currentVisaStatus,
        visaExpiry: !!legalProfile?.visaExpiry,
        currentEmployer: !!legalProfile?.currentEmployer,
      },
    };
  }

  /**
   * Returns the last active session for a user's most recent case.
   * Used to resume conversations after login.
   */
  async getActiveSession(userId: string) {
    const session = await this.prisma.guidanceSession.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      include: {
        case: { select: { id: true, caseNumber: true, caseType: true, status: true } },
      },
    });
    return session;
  }
}
