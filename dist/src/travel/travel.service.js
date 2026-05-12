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
exports.TravelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const audit_service_1 = require("../audit/audit.service");
let TravelService = class TravelService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(userId, dto) {
        const plan = await this.prisma.travelPlan.create({
            data: {
                caseId: dto.caseId,
                fromLocation: dto.fromLocation,
                toLocation: dto.toLocation,
                airline: dto.airline,
                flightNumber: dto.flightNumber,
                portOfEntry: dto.portOfEntry,
                arrivalDatetime: new Date(dto.arrivalDatetime),
                visaType: dto.visaType,
                purposeOfTravel: dto.purposeOfTravel,
            },
        });
        await this.prisma.caseEvent.create({
            data: {
                caseId: dto.caseId,
                eventType: 'TRAVEL_CREATED',
                actorType: 'USER',
                actorId: userId,
                metadata: { from: dto.fromLocation, to: dto.toLocation, port: dto.portOfEntry },
            },
        });
        await this.audit.log({
            actorId: userId,
            action: 'TRAVEL_PLAN_CREATED',
            entityType: 'TravelPlan',
            entityId: plan.id,
        });
        return plan;
    }
    async findByCase(caseId) {
        const plan = await this.prisma.travelPlan.findUnique({ where: { caseId } });
        if (!plan)
            throw new common_1.NotFoundException('No travel plan for this case');
        return plan;
    }
    async generatePrepPack(planId, userId) {
        const plan = await this.prisma.travelPlan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Travel plan not found');
        const prepPack = {
            generatedAt: new Date().toISOString(),
            travel: {
                from: plan.fromLocation,
                to: plan.toLocation,
                port: plan.portOfEntry,
                arrival: plan.arrivalDatetime,
                visa: plan.visaType,
            },
            checklist: [
                { item: 'Valid passport (6+ months validity)', checked: false },
                { item: `${plan.visaType} visa stamp/document`, checked: false },
                { item: 'I-94 arrival/departure record', checked: false },
                { item: 'Return ticket or onward travel proof', checked: false },
                { item: 'Proof of accommodation', checked: false },
                { item: 'Financial proof (bank statements)', checked: false },
                { item: 'Employment/university letter', checked: false },
                { item: 'Travel insurance documentation', checked: false },
            ],
            portInfo: {
                name: plan.portOfEntry,
                tips: [
                    'Have all documents easily accessible, not in checked luggage',
                    'Be prepared to explain purpose of visit clearly and concisely',
                    'Keep phone charged for any digital document access',
                    'Know your US address and contact person details',
                ],
            },
            inspectionGuide: {
                expect: [
                    'Biometric capture (fingerprints and photo)',
                    'Questions about purpose and duration of stay',
                    'Possible secondary inspection (random or flagged)',
                ],
                rights: [
                    'You have the right to an interpreter',
                    'You can request to speak with a supervisor',
                    'You do not have to sign anything you do not understand',
                    'You can contact your embassy/consulate',
                ],
            },
        };
        const updated = await this.prisma.travelPlan.update({
            where: { id: planId },
            data: { prepPack },
        });
        await this.prisma.caseEvent.create({
            data: {
                caseId: plan.caseId,
                eventType: 'PREP_PACK_GENERATED',
                actorType: 'SYSTEM',
                metadata: { planId },
            },
        });
        return updated;
    }
};
exports.TravelService = TravelService;
exports.TravelService = TravelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], TravelService);
//# sourceMappingURL=travel.service.js.map