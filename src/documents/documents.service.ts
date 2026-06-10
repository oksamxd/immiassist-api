import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async upload(userId: string, caseId: string, docType: string, file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    fs.writeFileSync(filePath, file.buffer);

    const doc = await this.prisma.document.create({
      data: {
        caseId,
        uploadedBy: userId,
        documentType: docType as any,
        fileUrl: `/uploads/${fileName}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        verificationStatus: 'PENDING',
        metadata: { size: file.size, uploadedBy: userId },
      },
    });

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        eventType: 'DOCUMENT_UPLOADED',
        title: `Document Uploaded: ${docType}`,
        description: `${docType} document uploaded by member.`,
        actorType: 'USER',
        actorId: userId,
        metadata: { docType, fileName: file.originalname, documentId: doc.id },
      },
    });

    // Notify legal team that a new document is available for review
    const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (caseRecord?.assignedLegalAssociateId) {
      await this.prisma.notification.create({
        data: {
          userId: caseRecord.assignedLegalAssociateId,
          caseId,
          type: 'DOCUMENT_UPLOADED',
          title: `📄 New Document: ${docType}`,
          message: `A new ${docType} document has been uploaded and is pending review.`,
        },
      });
    }
    if (caseRecord?.assignedLawyerId) {
      await this.prisma.notification.create({
        data: {
          userId: caseRecord.assignedLawyerId,
          caseId,
          type: 'DOCUMENT_UPLOADED',
          title: `📄 New Document: ${docType}`,
          message: `A new ${docType} document has been uploaded and is pending review.`,
        },
      });
    }

    await this.audit.log({
      actorId: userId,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: doc.id,
      payload: { docType, caseId, fileName: file.originalname },
    });

    return doc;
  }

  async uploadOnboarding(userId: string, docType: string, file: Express.Multer.File) {
    let existingCase = await this.prisma.case.findFirst({
      where: { userId, status: 'NEW' },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingCase) {
      const caseNumber = `IMM-OB-${Date.now().toString(36).toUpperCase()}`;
      existingCase = await this.prisma.case.create({
        data: {
          caseNumber,
          userId,
          caseType: 'VISA_PROCESSING',
          status: 'NEW',
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
      include: { case: { select: { caseNumber: true, caseType: true } } },
    });
  }

  /**
   * Returns all documents pending verification — for legal team use.
   */
  async findPendingForLegalTeam() {
    return this.prisma.document.findMany({
      where: { verificationStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            caseType: true,
            status: true,
            member: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  /**
   * Legal team verifies or rejects a document.
   */
  async verifyDocument(
    id: string,
    status: 'VERIFIED' | 'REJECTED' | 'NEEDS_RESUBMISSION',
    notes: string | undefined,
    actorId: string,
  ) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');

    const updated = await this.prisma.document.update({
      where: { id },
      data: { verificationStatus: status, notes },
    });

    await this.prisma.caseEvent.create({
      data: {
        caseId: doc.caseId,
        eventType: 'DOCUMENT_VERIFIED',
        title: `Document ${status}: ${doc.documentType}`,
        description: notes || `Document verification status set to ${status}.`,
        actorType: 'USER',
        actorId,
        metadata: { documentId: id, status, docType: doc.documentType },
      },
    });

    // Notify the member
    const caseRecord = await this.prisma.case.findUnique({ where: { id: doc.caseId } });
    if (caseRecord) {
      const statusMessages: Record<string, string> = {
        VERIFIED: `✅ Your ${doc.documentType} document has been verified.`,
        REJECTED: `❌ Your ${doc.documentType} document was rejected. ${notes ? `Reason: ${notes}` : ''}`,
        NEEDS_RESUBMISSION: `⚠️ Your ${doc.documentType} document needs to be resubmitted. ${notes ? `Reason: ${notes}` : ''}`,
      };
      await this.prisma.notification.create({
        data: {
          userId: caseRecord.userId,
          caseId: doc.caseId,
          type: `DOCUMENT_${status}`,
          title: `Document ${status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}`,
          message: statusMessages[status] || `Document status updated to ${status}.`,
        },
      });
    }

    await this.audit.log({
      actorId,
      action: `DOCUMENT_${status}`,
      entityType: 'Document',
      entityId: id,
      payload: { status, notes, docType: doc.documentType },
    });

    return updated;
  }

  /**
   * Streams the actual document file to the client.
   */
  getDocumentStream(filePath: string): StreamableFile {
    const absolutePath = path.join(process.cwd(), 'uploads', path.basename(filePath));
    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException('File not found on server');
    }
    const stream = createReadStream(absolutePath);
    return new StreamableFile(stream);
  }
}
