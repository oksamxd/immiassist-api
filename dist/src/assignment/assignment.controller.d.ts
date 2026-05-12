import { AssignmentService } from './assignment.service';
export declare class AssignmentController {
    private readonly assignmentService;
    constructor(assignmentService: AssignmentService);
    assignSupport(req: any, caseId: string): Promise<{
        caseId: string;
        agent: {
            id: string;
            name: string;
        };
    }>;
    alertLawyer(req: any, caseId: string): Promise<{
        caseId: string;
        lawyer: {
            id: string;
            name: string;
        };
    }>;
    lawyerAccept(req: any, caseId: string): Promise<{
        caseId: string;
        accepted: boolean;
    }>;
}
