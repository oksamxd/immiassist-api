import { ConfigService } from '@nestjs/config';
export interface OrchestratorResponse {
    message: string;
    options?: string[];
    nextAction?: string;
    fieldToSave?: {
        field: string;
        value: string;
    };
    caseStatus?: string;
    timelineEvent?: {
        type: string;
        title: string;
        description: string;
    };
    suggestedDocuments?: string[];
    appointmentDetails?: {
        type: string;
        scheduledAt: string;
    };
    phase?: OnboardingPhase;
}
export type OnboardingPhase = 'MEMBER_PROFILE' | 'LEGAL_PROFILE' | 'CASE_CREATION' | 'DOCUMENTS' | 'REVIEW' | 'ACTIVE';
export interface OnboardingContext {
    phase: OnboardingPhase;
    profile: {
        passportNumber?: string | null;
        nationality?: string | null;
        countryOfResidence?: string | null;
        visaType?: string | null;
        preferredLanguage?: string | null;
        emergencyContact?: string | null;
        portOfEntry?: string | null;
    };
    legalProfile?: {
        currentVisaStatus?: string | null;
        visaExpiry?: string | null;
        currentEmployer?: string | null;
        university?: string | null;
    };
    uploadedDocuments: string[];
    requiredDocuments: string[];
    caseType?: string;
    caseStatus?: string;
    caseNumber?: string;
    lawyer?: {
        name: string;
    };
    messageHistory?: any[];
}
export declare class AiService {
    private readonly configService;
    private readonly logger;
    private apiKey;
    private knowledgeBase;
    private prompts;
    constructor(configService: ConfigService);
    private loadKnowledgeBase;
    private get isGemini();
    private get isConfigured();
    private buildSystemPrompt;
    orchestrate(ctx: OnboardingContext, userMessage: string): Promise<OrchestratorResponse>;
    summarizeCase(caseData: any): Promise<string>;
    generateTenMinutePlan(ctx: OnboardingContext): Promise<any>;
    evaluateAirportRisk(ctx: OnboardingContext, issueType: string, contextString: string): Promise<any>;
    private callLlmJson;
    detectPhase(ctx: Partial<OnboardingContext>): OnboardingPhase;
    private getStructuredFallback;
    transcribeAudio(buffer: Buffer, filename: string): Promise<string>;
    synthesizeSpeechStream(text: string): Promise<any>;
}
