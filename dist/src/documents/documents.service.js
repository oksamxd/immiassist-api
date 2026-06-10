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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const audit_service_1 = require("../audit/audit.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
let DocumentsService = class DocumentsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    }
    async upload(userId, caseId, docType, file) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(process.cwd(), 'uploads', fileName);
        fs.writeFileSync(filePath, file.buffer);
        const doc = await this.prisma.document.create({
            data: {
                caseId,
                uploadedBy: userId,
                documentType: docType,
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
    async uploadOnboarding(userId, docType, file) {
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
    async findByCase(caseId) {
        return this.prisma.document.findMany({
            where: { caseId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async findAllByUser(userId) {
        return this.prisma.document.findMany({
            where: { case: { userId } },
            orderBy: { createdAt: 'desc' },
            include: { case: { select: { caseNumber: true, caseType: true } } },
        });
    }
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
    async verifyDocument(id, status, notes, actorId) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
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
        const caseRecord = await this.prisma.case.findUnique({ where: { id: doc.caseId } });
        if (caseRecord) {
            const statusMessages = {
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
    getDocumentStream(filePath) {
        const absolutePath = path.join(process.cwd(), 'uploads', path.basename(filePath));
        if (!fs.existsSync(absolutePath)) {
            throw new common_1.NotFoundException('File not found on server');
        }
        const stream = (0, fs_1.createReadStream)(absolutePath);
        return new common_1.StreamableFile(stream);
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map