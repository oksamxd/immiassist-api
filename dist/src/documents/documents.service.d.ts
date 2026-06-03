import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    upload(userId: string, caseId: string, docType: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        uploadedBy: string | null;
        documentType: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
        aiExtracted: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    uploadOnboarding(userId: string, docType: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        uploadedBy: string | null;
        documentType: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
        aiExtracted: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findByCase(caseId: string): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        uploadedBy: string | null;
        documentType: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
        aiExtracted: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        uploadedBy: string | null;
        documentType: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
        aiExtracted: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAllByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        caseId: string;
        uploadedBy: string | null;
        documentType: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
        aiExtracted: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
