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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMemberDashboard(userId) {
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
    async getLawyerDashboard(lawyerUserId) {
        const lawyer = await this.prisma.lawyer.findUnique({ where: { userId: lawyerUserId } });
        if (!lawyer)
            return { error: 'Lawyer not found' };
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
    async getAssociateDashboard(associateUserId) {
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map