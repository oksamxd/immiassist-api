import { StreamableFile } from '@nestjs/common';
import { AiService } from './ai.service';
export declare class VoiceController {
    private readonly aiService;
    constructor(aiService: AiService);
    transcribeAudio(file: any): Promise<{
        success: boolean;
        text: string;
    }>;
    synthesizeSpeechGet(text: string): Promise<StreamableFile>;
    synthesizeSpeechPost(text: string): Promise<StreamableFile>;
}
