import { AssignmentService } from './assignment.service';
export declare class AssignmentController {
    private readonly assignmentService;
    constructor(assignmentService: AssignmentService);
    assignSupport(req: any, caseId: string): Promise<{
        caseId: string;
        agent: {
            id: any;
            name: any;
        };
    }>;
    alertLawyer(req: any, caseId: string): Promise<{
        caseId: string;
        lawyer: {
            id: any;
            name: any;
        };
    }>;
    lawyerAccept(req: any, caseId: string): Promise<{
        caseId: string;
        accepted: boolean;
    }>;
}
