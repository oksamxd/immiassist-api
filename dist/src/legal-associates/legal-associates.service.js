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
exports.LegalAssociatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let LegalAssociatesService = class LegalAssociatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async getProfile(userId) {
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
    async updateAvailability(userId, available) {
        return this.prisma.legalAssociate.update({
            where: { userId },
            data: { availabilityStatus: available },
        });
    }
};
exports.LegalAssociatesService = LegalAssociatesService;
exports.LegalAssociatesService = LegalAssociatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LegalAssociatesService);
//# sourceMappingURL=legal-associates.service.js.map