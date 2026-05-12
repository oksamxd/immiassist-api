/**
 * Audit Logger — Tracks all system actions for compliance
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    actorId?: string;
    actorType?: string;
    action: string;
    entityType: string;
    entityId: string;
    payload?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorType: params.actorType || 'SYSTEM',
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        payload: params.payload || {},
      },
    });
  }
}
