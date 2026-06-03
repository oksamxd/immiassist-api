import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseStatusDto } from './dto/case.dto';
export declare class CasesController {
    private readonly casesService;
    constructor(casesService: CasesService);
    create(req: any, dto: CreateCaseDto): Promise<any>;
    findAll(req: any): Promise<any>;
    findOne(id: string): Promise<any>;
    updateStatus(req: any, id: string, dto: UpdateCaseStatusDto): Promise<any>;
}
