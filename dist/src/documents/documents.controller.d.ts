import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    upload(req: any, file: Express.Multer.File, caseId: string, docType: string): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        aiExtracted: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    uploadOnboarding(req: any, file: Express.Multer.File, docType: string): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        aiExtracted: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findByCase(caseId: string): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        aiExtracted: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findMine(req: any): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        aiExtracted: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileName: string | null;
        mimeType: string | null;
        aiExtracted: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
