import { ConfigService } from '@nestjs/config';
export interface OrchestratorResponse {
    message: string;
    options?: string[];
    nextAction?: string;
    caseStatus?: string;
    timelineEvent?: {
        type: string;
        title: string;
        description: string;
    };
    suggestedDocuments?: string[];
}
export declare class AiService {
    private readonly configService;
    private readonly logger;
    private apiKey;
    constructor(configService: ConfigService);
    private get isConfigured();
    private buildSystemPrompt;
    orchestrate(context: any, userMessage: string): Promise<OrchestratorResponse>;
    summarizeCase(caseData: any): Promise<string>;
    private getMockOrchestration;
}
