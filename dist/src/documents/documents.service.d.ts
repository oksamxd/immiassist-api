import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    upload(userId: string, caseId: string, docType: string, file: Express.Multer.File): Promise<any>;
    uploadOnboarding(userId: string, docType: string, file: Express.Multer.File): Promise<any>;
    findByCase(caseId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    findAllByUser(userId: string): Promise<any>;
}
