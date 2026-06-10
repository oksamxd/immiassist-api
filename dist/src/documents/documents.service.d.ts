import { StreamableFile } from '@nestjs/common';
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
    findAllByUser(userId: string): Promise<({
        case: {
            caseNumber: string;
            caseType: import("@prisma/client").$Enums.CaseType;
        };
    } & {
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
    })[]>;
    findPendingForLegalTeam(): Promise<({
        case: {
            id: string;
            caseNumber: string;
            caseType: import("@prisma/client").$Enums.CaseType;
            status: import("@prisma/client").$Enums.CaseStatus;
            member: {
                id: string;
                email: string;
                name: string;
            };
        };
    } & {
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
    })[]>;
    verifyDocument(id: string, status: 'VERIFIED' | 'REJECTED' | 'NEEDS_RESUBMISSION', notes: string | undefined, actorId: string): Promise<{
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
    getDocumentStream(filePath: string): StreamableFile;
}
