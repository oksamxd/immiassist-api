import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private readonly configService;
    private readonly logger;
    private apiKey;
    constructor(configService: ConfigService);
    private get isConfigured();
    generateGuidance(context: any, userMessage: string): Promise<string>;
    generatePrepPackAI(travelPlan: any): Promise<any>;
    private getMockGuidance;
}
