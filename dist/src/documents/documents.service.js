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
                type: docType,
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
    async uploadOnboarding(userId, docType, file) {
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
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map