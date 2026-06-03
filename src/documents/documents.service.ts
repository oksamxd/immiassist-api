import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async upload(userId: string, caseId: string, docType: string, file: Express.Multer.File) {
    // Save file to uploads directory
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    fs.writeFileSync(filePath, file.buffer);

    const doc = await this.prisma.document.create({
      data: {
        caseId,
        type: docType as any,
        fileUrl: `/uploads/${fileName}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        metadata: { size: file.size, uploadedBy: userId },
      },
    });

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'DOCUMENT_UPLOADED',
        actorType: 'USER',
        actorId: userId,
        metadata: { docType, fileName: file.originalname },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: doc.id,
      payload: { docType, caseId },
    });

    return doc;
  }

  async uploadOnboarding(userId: string, docType: string, file: Express.Multer.File) {
    // For onboarding docs, create or find an OPEN case for this user
    let existingCase = await this.prisma.case.findFirst({
      where: { userId, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingCase) {
      const caseNumber = `IMM-OB-${Date.now().toString(36).toUpperCase()}`;
      existingCase = await this.prisma.case.create({
        data: {
          caseNumber,
          userId,
          caseType: 'TRAVEL_PREP',
          status: 'OPEN',
          summary: 'Onboarding case - document collection',
        },
      });
    }

    return this.upload(userId, existingCase.id, docType, file);
  }

  async findByCase(caseId: string) {
    return this.prisma.document.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async findAllByUser(userId: string) {
    return this.prisma.document.findMany({
      where: { case: { userId } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
