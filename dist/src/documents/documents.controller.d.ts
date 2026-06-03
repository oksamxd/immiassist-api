import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    upload(req: any, file: Express.Multer.File, caseId: string, docType: string): Promise<{
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
    uploadOnboarding(req: any, file: Express.Multer.File, docType: string): Promise<{
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
    findMine(req: any): Promise<{
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
}
