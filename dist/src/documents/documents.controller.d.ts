import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    upload(req: any, file: Express.Multer.File, caseId: string, docType: string): Promise<any>;
    uploadOnboarding(req: any, file: Express.Multer.File, docType: string): Promise<any>;
    findByCase(caseId: string): Promise<any>;
    findMine(req: any): Promise<any>;
    findOne(id: string): Promise<any>;
}
