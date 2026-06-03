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
const crypto = __importStar(require("crypto"));
let UsersService = class UsersService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
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
        await this.prisma.memberProfile.create({
            data: { userId: user.id },
        });
        const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || user.passwordHash !== this.hashPassword(dto.password)) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
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
        };
    }
    async updateProfile(userId, dto) {
        const data = {};
        if (dto.passportNumber !== undefined)
            data.passportNumber = dto.passportNumber;
        if (dto.nationality !== undefined)
            data.nationality = dto.nationality;
        if (dto.visaType !== undefined)
            data.visaType = dto.visaType;
        if (dto.visaExpiry !== undefined)
            data.visaExpiry = new Date(dto.visaExpiry);
        if (dto.employerOrUniversity !== undefined)
            data.employerOrUniversity = dto.employerOrUniversity;
        if (dto.portOfEntry !== undefined)
            data.portOfEntry = dto.portOfEntry;
        if (dto.preferredLanguage !== undefined)
            data.preferredLanguage = dto.preferredLanguage;
        if (dto.emergencyContact !== undefined)
            data.emergencyContact = dto.emergencyContact;
        return this.prisma.memberProfile.update({
            where: { userId },
            data,
        });
    }
    async getOnboardingStatus(userId) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_strategy_1.JwtStrategy])
], UsersService);
//# sourceMappingURL=users.service.js.map