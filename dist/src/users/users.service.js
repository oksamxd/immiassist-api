"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
const audit_service_1 = require("../audit/audit.service");
const crypto = __importStar(require("crypto"));
let UsersService = class UsersService {
    prisma;
    jwt;
    audit;
    constructor(prisma, jwt, audit) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.audit = audit;
    }
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: this.hashPassword(dto.password),
                phone: dto.phone,
                role: 'MEMBER',
            },
        });
        await this.prisma.memberProfile.create({ data: { userId: user.id } });
        await this.prisma.legalProfile.create({ data: { userId: user.id } });
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || user.passwordHash !== this.hashPassword(dto.password)) {
            await this.audit.log({
                actorType: 'ANONYMOUS',
                action: 'LOGIN_FAILED',
                entityType: 'User',
                entityId: dto.email,
                payload: { email: dto.email, reason: 'Invalid credentials' },
            }).catch(() => { });
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        await this.audit.log({
            actorId: user.id,
            action: 'LOGIN_SUCCESS',
            entityType: 'User',
            entityId: user.id,
            payload: { email: user.email, role: user.role, loginAt: new Date().toISOString() },
        });
        const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
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
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, legalProfile: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
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
    async updateProfile(userId, dto) {
        const memberData = {};
        if (dto.passportNumber !== undefined)
            memberData.passportNumber = dto.passportNumber;
        if (dto.nationality !== undefined)
            memberData.nationality = dto.nationality;
        if (dto.visaType !== undefined)
            memberData.visaType = dto.visaType;
        if (dto.countryOfResidence !== undefined)
            memberData.countryOfResidence = dto.countryOfResidence;
        if (dto.preferredLanguage !== undefined)
            memberData.preferredLanguage = dto.preferredLanguage;
        if (dto.emergencyContact !== undefined)
            memberData.emergencyContact = dto.emergencyContact;
        if (dto.travelHistory !== undefined)
            memberData.travelHistory = dto.travelHistory;
        if (Object.keys(memberData).length > 0) {
            await this.prisma.memberProfile.upsert({
                where: { userId },
                update: memberData,
                create: { userId, ...memberData },
            });
        }
        const legalData = {};
        if (dto.currentVisaStatus !== undefined)
            legalData.currentVisaStatus = dto.currentVisaStatus;
        if (dto.visaExpiry !== undefined)
            legalData.visaExpiry = new Date(dto.visaExpiry);
        if (dto.immigrationHistory !== undefined)
            legalData.immigrationHistory = dto.immigrationHistory;
        if (dto.previousNotices !== undefined)
            legalData.previousNotices = dto.previousNotices;
        if (dto.previousDenials !== undefined)
            legalData.previousDenials = dto.previousDenials;
        if (dto.currentEmployer !== undefined)
            legalData.currentEmployer = dto.currentEmployer;
        if (dto.university !== undefined)
            legalData.university = dto.university;
        if (dto.dependents !== undefined)
            legalData.dependents = dto.dependents;
        if (Object.keys(legalData).length > 0) {
            await this.prisma.legalProfile.upsert({
                where: { userId },
                create: { userId, ...legalData },
                update: legalData,
            });
        }
        await this.audit.log({
            actorId: userId,
            action: 'PROFILE_UPDATED',
            entityType: 'User',
            entityId: userId,
            payload: { memberFields: Object.keys(memberData), legalFields: Object.keys(legalData) },
        });
        return this.getProfile(userId);
    }
    async getOnboardingStatus(userId) {
        const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
        const legalProfile = await this.prisma.legalProfile.findUnique({ where: { userId } });
        const documents = await this.prisma.document.findMany({
            where: { case: { userId } },
            select: { documentType: true },
        });
        const uploadedTypes = documents.map((d) => d.documentType);
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
    async getActiveSession(userId) {
        const session = await this.prisma.guidanceSession.findFirst({
            where: { userId, status: 'ACTIVE' },
            orderBy: { updatedAt: 'desc' },
            include: {
                case: { select: { id: true, caseNumber: true, caseType: true, status: true } },
            },
        });
        return session;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_strategy_1.JwtStrategy,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map