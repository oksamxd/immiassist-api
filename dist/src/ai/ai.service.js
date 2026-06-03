"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AiService = AiService_1 = class AiService {
    configService;
    logger = new common_1.Logger(AiService_1.name);
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('GEMINI_API_KEY') || '';
    }
    get isConfigured() {
        return this.apiKey.length > 0;
    }
    async generateGuidance(context, userMessage) {
        if (!this.isConfigured) {
            return this.getMockGuidance(userMessage);
        }
        try {
            const systemPrompt = `You are Jana AI, an immigration assistance expert. You help users navigate US immigration processes including port of entry procedures, visa requirements, rights during inspection, and emergency guidance. Be concise, accurate, and reassuring. Context: ${JSON.stringify(context)}`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }] },
                    ],
                }),
            });
            const data = await response.json();
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || this.getMockGuidance(userMessage);
        }
        catch (error) {
            this.logger.error('Gemini API error', error);
            return this.getMockGuidance(userMessage);
        }
    }
    async generatePrepPackAI(travelPlan) {
        if (!this.isConfigured) {
            return {
                summary: `Travel preparation guide for ${travelPlan.visaType} visa holder traveling from ${travelPlan.fromLocation} to ${travelPlan.toLocation} via ${travelPlan.portOfEntry}.`,
                tips: [
                    'Arrive at the airport at least 3 hours before international departure',
                    'Keep all immigration documents in your carry-on bag',
                    'Have digital and physical copies of all documents',
                    'Know the address where you will be staying in the US',
                ],
            };
        }
        try {
            const prompt = `Generate a detailed immigration travel preparation guide for: Visa type: ${travelPlan.visaType}, From: ${travelPlan.fromLocation}, To: ${travelPlan.toLocation}, Port of Entry: ${travelPlan.portOfEntry}. Include checklist, tips, and what to expect at the port of entry. Return as JSON with keys: summary, checklist (array of items), portTips (array), inspectionGuide.`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                }),
            });
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text };
            }
            catch {
                return { summary: text };
            }
        }
        catch (error) {
            this.logger.error('Gemini prep pack error', error);
            return { summary: 'AI prep pack generation failed. Using default checklist.' };
        }
    }
    getMockGuidance(message) {
        const lower = message.toLowerCase();
        if (lower.includes('detained') || lower.includes('arrest')) {
            return '🚨 If you are being detained at a port of entry:\n\n1. Stay calm and be respectful\n2. You have the right to remain silent beyond providing identification\n3. Ask for the reason for detention\n4. Request to contact your embassy or consulate\n5. Do NOT sign any documents you don\'t understand\n6. You can request an interpreter\n7. Contact a lawyer immediately — ImmiAssist can connect you with one\n\nWould you like me to alert a lawyer on your behalf?';
        }
        if (lower.includes('visa') || lower.includes('document')) {
            return '📋 Document Preparation Tips:\n\n1. Keep your passport valid for at least 6 months beyond your stay\n2. Have your visa, I-20/DS-2019/I-797 easily accessible\n3. Carry proof of ties to your home country\n4. Have your I-94 arrival record\n5. Keep financial proof and employment/university letters handy\n\nWould you like help creating a document checklist for your specific visa type?';
        }
        if (lower.includes('question') || lower.includes('interview') || lower.includes('inspect')) {
            return '🗣️ Port of Entry Interview Tips:\n\n1. Answer honestly and concisely\n2. Common questions: Purpose of visit, duration of stay, where staying, employment/school details\n3. Have supporting documents ready\n4. If sent to secondary inspection, stay calm — it\'s routine in many cases\n5. You can request a supervisor if you feel your rights are being violated\n\nNeed help preparing for specific questions?';
        }
        return '👋 Hello! I\'m Jana AI, your immigration assistance guide.\n\nI can help you with:\n• 📋 Document preparation and checklists\n• ✈️ Port of entry procedures\n• 🗣️ Interview preparation\n• ⚖️ Your rights during inspection\n• 🚨 Emergency guidance if detained\n• 📝 Travel plan preparation\n\nWhat would you like help with today?';
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map