import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface AuditLogDto {
  actorId?: string;
  actorType?: string;
  action: string;
  entityType: string;
  entityId: string;
  payload?: any;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: AuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        actorId: dto.actorId,
        actorType: dto.actorType || 'USER',
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        payload: dto.payload,
      },
    });
  }
}
