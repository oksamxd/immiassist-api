"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const genai_1 = require("@google/genai");
const REQUIRED_MEMBER_FIELDS = [
    'passportNumber',
    'nationality',
    'countryOfResidence',
    'visaType',
];
const REQUIRED_LEGAL_FIELDS = [
    'currentVisaStatus',
    'visaExpiry',
    'currentEmployer',
];
const REQUIRED_DOCUMENTS = ['PASSPORT', 'VISA'];
function detectPhase(ctx) {
    const profile = ctx.profile || {};
    const memberComplete = REQUIRED_MEMBER_FIELDS.every((f) => profile[f]);
    if (!memberComplete)
        return 'MEMBER_PROFILE';
    const legalProfile = ctx.legalProfile || {};
    const legalComplete = REQUIRED_LEGAL_FIELDS.every((f) => legalProfile[f]);
    if (!legalComplete)
        return 'LEGAL_PROFILE';
    const uploaded = ctx.uploadedDocuments || [];
    const docsComplete = REQUIRED_DOCUMENTS.every((d) => uploaded.includes(d));
    if (!docsComplete)
        return 'DOCUMENTS';
    if (ctx.caseStatus === 'UNDER_REVIEW')
        return 'REVIEW';
    return 'ACTIVE';
}
let AiService = AiService_1 = class AiService {
    configService;
    logger = new common_1.Logger(AiService_1.name);
    apiKey;
    knowledgeBase = '';
    prompts;
    constructor(configService) {
        this.configService = configService;
        this.apiKey =
            this.configService.get('OPENAI_API_KEY') ||
                this.configService.get('GEMINI_API_KEY') ||
                '';
        this.loadKnowledgeBase();
    }
    loadKnowledgeBase() {
        try {
            const kbDir = path.join(process.cwd(), 'knowledge');
            const files = [
                'intents.json', 'faq.json', 'quick_replies.json',
                'conversation_templates.json', 'airport_guidance.json',
                'visa_checklists.json', 'notice_guidance.json',
                'escalation_rules.json', 'status_messages.json'
            ];
            let kbString = 'KNOWLEDGE BASE:\n';
            for (const file of files) {
                try {
                    const content = fs.readFileSync(path.join(kbDir, file), 'utf8');
                    kbString += `\n--- ${file} ---\n${content}\n`;
                }
                catch (e) {
                }
            }
            this.knowledgeBase = kbString;
            try {
                const promptsDir = path.join(kbDir, 'immi_prompts');
                this.prompts = {
                    system: fs.readFileSync(path.join(promptsDir, 'system/system_prompt.txt'), 'utf8'),
                    intake: fs.readFileSync(path.join(promptsDir, 'intake/intake_prompt.txt'), 'utf8'),
                    travelPrep: fs.readFileSync(path.join(promptsDir, 'travel_prep/travel_prep_prompt.txt'), 'utf8'),
                    tenMinute: fs.readFileSync(path.join(promptsDir, 'ten_min_mode/ten_minute_prompt.txt'), 'utf8'),
                    airportLive: fs.readFileSync(path.join(promptsDir, 'airport_live/airport_live_prompt.txt'), 'utf8'),
                    noticeAnalysis: fs.readFileSync(path.join(promptsDir, 'notice_depart/notice_analysis_prompt.txt'), 'utf8'),
                    risk: fs.readFileSync(path.join(promptsDir, 'risk/risk_prompt.txt'), 'utf8'),
                };
            }
            catch (e) {
                this.logger.warn('Could not load specialized prompts (immi_prompts): ' + e.message);
            }
        }
        catch (e) {
            this.logger.error('Failed to load knowledge base', e);
        }
    }
    get isGemini() {
        return this.apiKey.length > 10 && !this.apiKey.startsWith('sk-');
    }
    get isConfigured() {
        return this.apiKey.length > 10;
    }
    buildSystemPrompt(ctx) {
        const missingMemberFields = REQUIRED_MEMBER_FIELDS.filter((f) => !ctx.profile?.[f]);
        const missingLegalFields = REQUIRED_LEGAL_FIELDS.filter((f) => !ctx.legalProfile?.[f]);
        const missingDocs = (ctx.requiredDocuments || REQUIRED_DOCUMENTS).filter((d) => !ctx.uploadedDocuments?.includes(d));
        return `You are Jana — a senior immigration case orchestrator at ImmiAssist. You are NOT a general chatbot. You follow a strict workflow.

CURRENT PHASE: ${ctx.phase}
CASE: ${ctx.caseNumber || 'New'} | TYPE: ${ctx.caseType || 'Not set'} | STATUS: ${ctx.caseStatus || 'New'}
MEMBER PROFILE: ${missingMemberFields.length === 0 ? 'Complete' : `Missing: ${missingMemberFields.join(', ')}`}
LEGAL PROFILE: ${missingLegalFields.length === 0 ? 'Complete' : `Missing: ${missingLegalFields.join(', ')}`}
DOCUMENTS UPLOADED: ${ctx.uploadedDocuments?.join(', ') || 'None'}
MISSING DOCUMENTS: ${missingDocs.join(', ') || 'None'}

PHASE RULES (follow strictly):
- MEMBER_PROFILE phase: Collect missing basic profile fields one at a time. Set nextAction="SAVE_PROFILE_FIELD" and fieldToSave.
- LEGAL_PROFILE phase: Collect missing legal and immigration fields one at a time. Set nextAction="SAVE_PROFILE_FIELD" and fieldToSave.
- DOCUMENTS phase: Profiles are complete. Guide the user to upload specific missing documents. Set nextAction="UPLOAD_DOCUMENT" and suggestedDocuments to the missing doc types.
- REVIEW phase: All data collected. Summarise the case and inform the user their legal team will contact them.
- ACTIVE phase: Answer any questions regarding the immigration process, terminology, and FAQs using the provided KNOWLEDGE BASE. If the user asks about court dates or appointments, refer to the provided context. If you don't know the answer, tell the user to ask their assigned lawyer. Keep your tone professional, empathetic, and clear.

PROFILE FIELDS AND THEIR FRIENDLY NAMES:
- passportNumber → "Passport number"
- nationality → "Nationality / country of citizenship"
- countryOfResidence → "Country of residence"
- visaType → "Current visa type (e.g. F-1, H-1B, B-2, etc.)"
- currentVisaStatus → "Current visa status (valid, expired, pending)"
- visaExpiry → "Visa expiry date (YYYY-MM-DD)"
- currentEmployer → "Current employer"
- university → "Current university (if applicable)"
- portOfEntry → "Port of entry (city where you entered the country)"
- emergencyContact → "Emergency contact (name and phone)"
- preferredLanguage → "Preferred language for communication"

DOCUMENT TYPES AND THEIR FRIENDLY NAMES:
- PASSPORT → "Passport (bio-data page)"
- VISA → "Current visa stamp or approval notice"
- I797 → "I-797 Approval Notice"
- I20 → "Form I-20 (if on student visa)"
- EAD → "EAD Card (Employment Authorization Document)"
- EMPLOYMENT_LETTER → "Employer support letter"

STYLE RULES:
- Be concise, professional, empathetic. One question at a time.
- Never give legal advice. Refer to "your assigned lawyer" for legal questions.
- Do not mention being a chatbot or an AI model.

MANDATORY RESPONSE FORMAT (strict JSON, no extra text):
{
  "message": "Your message to the user",
  "options": ["Option A", "Option B"],
  "nextAction": "SAVE_PROFILE_FIELD | UPLOAD_DOCUMENT | ADVANCE_PHASE | SCHEDULE_CONSULTATION | CHECK_STATUS | NONE",
  "fieldToSave": { "field": "fieldName", "value": "extracted value" },
  "phase": "${ctx.phase}",
  "caseStatus": "current status string",
  "timelineEvent": { "type": "EVENT_TYPE", "title": "Title", "description": "Description" },
  "suggestedDocuments": ["DOC_TYPE_1"]
}

${this.knowledgeBase}`;
    }
    async orchestrate(ctx, userMessage) {
        ctx.phase = ctx.phase || detectPhase(ctx);
        if (!this.isConfigured) {
            return this.getStructuredFallback(ctx, userMessage);
        }
        try {
            const historyMessages = (ctx.messageHistory || [])
                .filter((m) => m.role === 'user' || m.role === 'assistant')
                .slice(-8)
                .map((m) => {
                let content = m.content;
                try {
                    const parsed = JSON.parse(content);
                    content = parsed.message || content;
                }
                catch { }
                return { role: m.role, content };
            });
            let text = '';
            if (this.isGemini) {
                const ai = new genai_1.GoogleGenAI({ apiKey: this.apiKey });
                const geminiMessages = historyMessages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));
                geminiMessages.push({ role: 'user', parts: [{ text: userMessage }] });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: geminiMessages,
                    config: {
                        systemInstruction: this.buildSystemPrompt(ctx),
                        responseMimeType: 'application/json',
                        temperature: 0.3,
                    }
                });
                text = response.text || '';
            }
            else {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        response_format: { type: 'json_object' },
                        messages: [
                            { role: 'system', content: this.buildSystemPrompt(ctx) },
                            ...historyMessages,
                            { role: 'user', content: userMessage },
                        ],
                        temperature: 0.3,
                        max_tokens: 600,
                    }),
                });
                if (!response.ok) {
                    if (response.status === 429) {
                        return this.getStructuredFallback(ctx, userMessage);
                    }
                    const err = await response.text();
                    this.logger.error(`OpenAI error ${response.status}: ${err}`);
                    return this.getStructuredFallback(ctx, userMessage);
                }
                const data = await response.json();
                text = data?.choices?.[0]?.message?.content || '';
            }
            try {
                const parsed = JSON.parse(text);
                parsed.phase = parsed.phase || ctx.phase;
                return parsed;
            }
            catch {
                return { message: text, phase: ctx.phase };
            }
        }
        catch (error) {
            this.logger.error('AI API error', error);
            return this.getStructuredFallback(ctx, userMessage);
        }
    }
    async summarizeCase(caseData) {
        if (!this.isConfigured) {
            return `${caseData.caseType?.replace(/_/g, ' ')} case — Status: ${caseData.status?.replace(/_/g, ' ')}.`;
        }
        try {
            if (this.isGemini) {
                const ai = new genai_1.GoogleGenAI({ apiKey: this.apiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Summarise this immigration case: ${JSON.stringify(caseData)}`,
                    config: {
                        systemInstruction: 'You are a legal case summariser. Be concise and professional. Two sentences max.',
                        temperature: 0.3,
                    }
                });
                return response.text || 'Summary unavailable.';
            }
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a legal case summariser. Be concise and professional. Two sentences max.' },
                        { role: 'user', content: `Summarise this case: ${JSON.stringify(caseData)}` }
                    ],
                    temperature: 0.3,
                }),
            });
            const data = await response.json();
            return data?.choices?.[0]?.message?.content || 'Summary unavailable.';
        }
        catch (e) {
            return 'Summary unavailable.';
        }
    }
    async generateTenMinutePlan(ctx) {
        if (!this.isConfigured || !this.prompts?.tenMinute)
            return null;
        let prompt = this.prompts.tenMinute
            .replace('{{visa_type}}', ctx.profile?.visaType || 'F1')
            .replace('{{language}}', ctx.profile?.preferredLanguage || 'English');
        return this.callLlmJson(prompt, this.prompts.system);
    }
    async evaluateAirportRisk(ctx, issueType, contextString) {
        if (!this.isConfigured || !this.prompts?.risk)
            return { risk_level: 'LOW' };
        const prompt = `Input:\n- issue_type: ${issueType}\n- context: ${contextString}\n\n${this.prompts.risk}`;
        return this.callLlmJson(prompt, this.prompts.system);
    }
    async callLlmJson(userPrompt, systemPrompt) {
        try {
            if (this.isGemini) {
                const ai = new genai_1.GoogleGenAI({ apiKey: this.apiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userPrompt,
                    config: {
                        systemInstruction: systemPrompt,
                        responseMimeType: 'application/json',
                        temperature: 0.3,
                    }
                });
                return JSON.parse(response.text || '{}');
            }
            else {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        response_format: { type: 'json_object' },
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.3,
                    }),
                });
                const data = await response.json();
                return JSON.parse(data?.choices?.[0]?.message?.content || '{}');
            }
        }
        catch (e) {
            this.logger.error('callLlmJson error', e);
            return null;
        }
    }
    detectPhase(ctx) {
        return detectPhase(ctx);
    }
    getStructuredFallback(ctx, message) {
        const phase = ctx.phase;
        if (phase === 'MEMBER_PROFILE' || phase === 'LEGAL_PROFILE') {
            const isMember = phase === 'MEMBER_PROFILE';
            const missingFields = isMember
                ? REQUIRED_MEMBER_FIELDS.filter((f) => !ctx.profile?.[f])
                : REQUIRED_LEGAL_FIELDS.filter((f) => !ctx.legalProfile?.[f]);
            const fieldLabels = {
                passportNumber: 'your passport number',
                nationality: 'your nationality / country of citizenship',
                countryOfResidence: 'your country of residence',
                visaType: 'your current visa type (e.g. F-1, H-1B, B-2)',
                currentVisaStatus: 'your current visa status (valid, expired, etc.)',
                visaExpiry: 'your visa expiry date',
                currentEmployer: 'your current employer',
            };
            if (missingFields.length === 0) {
                const nextPhase = detectPhase(ctx);
                if (nextPhase === 'LEGAL_PROFILE') {
                    return {
                        message: `Your basic profile is complete. Let's collect your legal and immigration details now.`,
                        nextAction: 'NONE',
                        phase: 'LEGAL_PROFILE',
                    };
                }
                else if (nextPhase === 'DOCUMENTS') {
                    return {
                        message: `Your profiles are complete. Next, we need you to upload some required documents.`,
                        nextAction: 'NONE',
                        phase: 'DOCUMENTS',
                    };
                }
                else {
                    return {
                        message: `Profile information collected. Moving to the next step.`,
                        nextAction: 'NONE',
                        phase: nextPhase,
                    };
                }
            }
            const nextField = missingFields[0];
            const friendly = fieldLabels[nextField] || nextField;
            const remaining = missingFields.length;
            const lowerMsg = message.toLowerCase().trim();
            const looksLikeAnswer = message.length > 0 && message.length < 120 && !lowerMsg.includes('?');
            if (looksLikeAnswer) {
                const nextNextField = missingFields[1];
                if (nextNextField) {
                    const nextFriendly = fieldLabels[nextNextField] || nextNextField;
                    return {
                        message: `Got it. Next, could you please provide ${nextFriendly}? (${remaining - 1} field${remaining - 1 !== 1 ? 's' : ''} remaining)`,
                        nextAction: 'SAVE_PROFILE_FIELD',
                        fieldToSave: { field: nextField, value: message.trim() },
                        phase: phase,
                    };
                }
                else {
                    return {
                        message: isMember
                            ? `Got it. Your basic profile is now complete — let's move on to your legal and immigration details.`
                            : `Got it. Your legal profile is complete — let's proceed to document uploads.`,
                        nextAction: 'SAVE_PROFILE_FIELD',
                        fieldToSave: { field: nextField, value: message.trim() },
                        phase: phase,
                    };
                }
            }
            return {
                message: `Please provide ${friendly} (${remaining} field${remaining !== 1 ? 's' : ''} remaining).`,
                nextAction: 'NONE',
                phase: phase,
                timelineEvent: {
                    type: 'PROFILE_UPDATE',
                    title: 'Profile Screening',
                    description: `Collecting required profile information.`,
                },
            };
        }
        if (phase === 'DOCUMENTS') {
            const missingDocs = REQUIRED_DOCUMENTS.filter((d) => !ctx.uploadedDocuments?.includes(d));
            const docLabels = {
                PASSPORT: 'Passport (bio-data page)',
                VISA: 'Current visa stamp or approval notice',
                I797: 'I-797 Approval Notice',
                I20: 'Form I-20',
                EAD: 'EAD Card',
            };
            const nextDoc = missingDocs[0];
            const lowerMsg = message.toLowerCase().trim();
            if (lowerMsg.includes('help')) {
                return {
                    message: `If you are having trouble finding or uploading your **${docLabels[nextDoc] || nextDoc}**, don't worry. Your legal team will assist you with this later. For now, please try to upload any other available documents, or contact support.`,
                    nextAction: 'NONE',
                    phase: 'DOCUMENTS',
                    options: ['I have uploaded it', 'Contact support'],
                };
            }
            if (lowerMsg.includes('uploaded')) {
                return {
                    message: `I don't see the **${docLabels[nextDoc] || nextDoc}** in our system yet. Please ensure the file was uploaded successfully using the upload area. If you're having trouble, let me know.`,
                    nextAction: 'UPLOAD_DOCUMENT',
                    phase: 'DOCUMENTS',
                    options: ['I need help with this document'],
                };
            }
            return {
                message: `Your profile is complete. Please upload your **${docLabels[nextDoc] || nextDoc}** to proceed. Use the upload button below.`,
                nextAction: 'UPLOAD_DOCUMENT',
                suggestedDocuments: missingDocs,
                phase: 'DOCUMENTS',
                options: ['I have uploaded it', 'I need help with this document'],
                timelineEvent: {
                    type: 'DOCUMENT_REQUESTED',
                    title: 'Document Upload Required',
                    description: `Missing: ${missingDocs.map((d) => docLabels[d] || d).join(', ')}`,
                },
            };
        }
        if (phase === 'REVIEW') {
            return {
                message: `Your profile and documents have been submitted for review. Your assigned legal associate will contact you within 1–2 business days to confirm your case details and next steps.`,
                nextAction: 'NONE',
                phase: 'REVIEW',
                caseStatus: 'UNDER_REVIEW',
                options: ['View my case summary', 'Contact support'],
            };
        }
        const lowerMsg = message.toLowerCase().trim();
        if (lowerMsg.includes('court') || lowerMsg.includes('hearing')) {
            return {
                message: `I can help you check your court dates. Based on our records, any upcoming court dates will be listed in your portal. If you need more details, please ask your lawyer.`,
                options: ['View my court dates', 'Schedule a consultation'],
                nextAction: 'NONE',
                phase: 'ACTIVE',
            };
        }
        return {
            message: `Your case is actively managed by your legal team. How can I assist you today? If you have questions about the process, feel free to ask.`,
            options: ['Upload a document', 'Schedule a consultation', 'Check case status', 'View upcoming court dates', 'What is an I-797?'],
            nextAction: 'NONE',
            phase: 'ACTIVE',
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map