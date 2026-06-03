import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTravelPlanDto } from './dto/travel.dto';

@Injectable()
export class TravelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(userId: string, dto: CreateTravelPlanDto) {
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

  async findByCase(caseId: string) {
    const plan = await this.prisma.travelPlan.findUnique({ where: { caseId } });
    if (!plan) throw new NotFoundException('No travel plan for this case');
    return plan;
  }

  async generatePrepPack(planId: string, userId: string) {
    const plan = await this.prisma.travelPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Travel plan not found');

    // Generate a structured prep pack
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
}
