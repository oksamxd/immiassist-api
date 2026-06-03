"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let LawyersService = class LawyersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async findByUserId(userId) {
        return this.prisma.lawyer.findUnique({
            where: { userId },
            include: { user: { select: { id: true, name: true, email: true, phone: true } } },
        });
    }
    async getProfile(userId) {
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
    async updateAvailability(userId, available) {
        return this.prisma.lawyer.update({
            where: { userId },
            data: { availabilityStatus: available },
        });
    }
    async updateProfile(userId, dto) {
        return this.prisma.lawyer.update({
            where: { userId },
            data: {
                specialization: dto.specialization,
                location: dto.location,
                languages: dto.languages,
            },
        });
    }
};
exports.LawyersService = LawyersService;
exports.LawyersService = LawyersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LawyersService);
//# sourceMappingURL=lawyers.service.js.map