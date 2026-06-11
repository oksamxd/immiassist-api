import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

export interface OrchestratorResponse {
  message: string;
  options?: string[];
  nextAction?: string;
  fieldToSave?: { field: string; value: string };
  caseStatus?: string;
  timelineEvent?: { type: string; title: string; description: string };
  suggestedDocuments?: string[];
  appointmentDetails?: { type: string; scheduledAt: string };
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
  lawyer?: { name: string };
  messageHistory?: any[];
}

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

function detectPhase(ctx: Partial<OnboardingContext>): OnboardingPhase {
  const profile = ctx.profile || {};
  const memberComplete = REQUIRED_MEMBER_FIELDS.every(
    (f) => profile[f as keyof typeof profile],
  );
  if (!memberComplete) return 'MEMBER_PROFILE';

  const legalProfile = ctx.legalProfile || {};
  const legalComplete = REQUIRED_LEGAL_FIELDS.every(
    (f) => legalProfile[f as keyof typeof legalProfile],
  );
  if (!legalComplete) return 'LEGAL_PROFILE';

  if (ctx.caseType === 'GENERAL_CONSULTATION') return 'CASE_CREATION';

  const uploaded = ctx.uploadedDocuments || [];
  const docsComplete = REQUIRED_DOCUMENTS.every((d) => uploaded.includes(d));
  if (!docsComplete) return 'DOCUMENTS';

  if (ctx.caseStatus === 'UNDER_REVIEW') return 'REVIEW';
  return 'ACTIVE';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private apiKey: string;
  private knowledgeBase: string = '';
  private prompts: any;

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('OPENAI_API_KEY') ||
      this.configService.get<string>('GEMINI_API_KEY') ||
      '';
    this.loadKnowledgeBase();
  }

  private loadKnowledgeBase() {
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
        } catch (e) {
          // Ignore missing files
        }
      }
      this.knowledgeBase = kbString;

      // Load specific prompts for specialized workflows
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
      } catch (e) {
        this.logger.warn('Could not load specialized prompts (immi_prompts): ' + e.message);
      }
    } catch (e) {
      this.logger.error('Failed to load knowledge base', e);
    }
  }

  private get isGemini(): boolean {
    return this.apiKey.length > 10 && !this.apiKey.startsWith('sk-');
  }

  private get isConfigured(): boolean {
    return this.apiKey.length > 10;
  }

  private buildSystemPrompt(ctx: OnboardingContext): string {
    const missingMemberFields = REQUIRED_MEMBER_FIELDS.filter(
      (f) => !ctx.profile?.[f as keyof typeof ctx.profile],
    );
    const missingLegalFields = REQUIRED_LEGAL_FIELDS.filter(
      (f) => !ctx.legalProfile?.[f as keyof typeof ctx.legalProfile],
    );
    const missingDocs = (ctx.requiredDocuments || REQUIRED_DOCUMENTS).filter(
      (d) => !ctx.uploadedDocuments?.includes(d),
    );
const displayMissingDocs = ctx.phase === 'DOCUMENTS' ? [] : missingDocs;

    return `You are Jana — a senior immigration case orchestrator at ImmiAssist. You are NOT a general chatbot. You follow a strict workflow.

CURRENT PHASE: ${ctx.phase}
CASE: ${ctx.caseNumber || 'New'} | TYPE: ${ctx.caseType || 'Not set'} | STATUS: ${ctx.caseStatus || 'New'}
MEMBER PROFILE: ${missingMemberFields.length === 0 ? 'Complete' : `Missing: ${missingMemberFields.join(', ')}`}
LEGAL PROFILE: ${missingLegalFields.length === 0 ? 'Complete' : `Missing: ${missingLegalFields.join(', ')}`}
DOCUMENTS UPLOADED: ${ctx.uploadedDocuments?.join(', ') || 'None'}
MISSING DOCUMENTS: ${displayMissingDocs.join(', ') || 'None'}

PHASE RULES (follow strictly):
- MEMBER_PROFILE phase: Collect missing basic profile fields one at a time. Set nextAction="SAVE_PROFILE_FIELD" and fieldToSave.
- LEGAL_PROFILE phase: Collect missing legal and immigration fields one at a time. Set nextAction="SAVE_PROFILE_FIELD" and fieldToSave.
- CASE_CREATION phase: Ask the user what kind of case they want to start (e.g. Visa Processing, Work Permit). Set nextAction="UPDATE_CASE_TYPE".
- DOCUMENTS phase: When the user indicates they uploaded ANY document, accept it as their Legal Notice to Depart or evidence. Immediately provide tailored preliminary advice based on all their profile information. Tell them the information has been sent to their legal team. Set nextAction="SCHEDULE_CONSULTATION", provide "appointmentDetails" to schedule a meeting, and set phase to ACTIVE. Do NOT ask for more documents.
- REVIEW phase: All data collected. Summarise the case and inform the user their legal team will contact them.
- ACTIVE phase: Answer any questions regarding the immigration process, terminology, and FAQs using the provided KNOWLEDGE BASE. If the user asks about court dates or appointments, refer to the provided context. If the user asks to schedule a consultation or appointment, set nextAction="SCHEDULE_CONSULTATION" and provide "appointmentDetails". If you don't know the answer, tell the user to ask their assigned lawyer. Keep your tone professional, empathetic, and clear.

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
  "suggestedDocuments": ["DOC_TYPE_1"],
  "appointmentDetails": { "type": "CONSULTATION", "scheduledAt": "2026-06-20T10:00:00Z" }
}

${this.knowledgeBase}`;
  }

  async orchestrate(ctx: OnboardingContext, userMessage: string): Promise<OrchestratorResponse> {
    // Ensure phase is correctly set
    ctx.phase = ctx.phase || detectPhase(ctx);

    if (!this.isConfigured || !this.prompts?.system) {
      return this.getStructuredFallback(ctx, userMessage);
    }

    try {
      const historyMessages = (ctx.messageHistory || [])
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map((m: any) => {
          let content = m.content;
          try {
            const parsed = JSON.parse(content);
            content = parsed.message || content;
          } catch { /* raw string */ }
          return { role: m.role, content };
        });

      let text = '';

      if (this.isGemini) {
        const ai = new GoogleGenAI({ apiKey: this.apiKey });
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
      } else {
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
        return parsed as OrchestratorResponse;
      } catch {
        return { message: text, phase: ctx.phase };
      }
    } catch (error) {
      this.logger.error('AI API error', error);
      return this.getStructuredFallback(ctx, userMessage);
    }
  }

  async summarizeCase(caseData: any): Promise<string> {
    if (!this.isConfigured) {
      return `${caseData.caseType?.replace(/_/g, ' ')} case — Status: ${caseData.status?.replace(/_/g, ' ')}.`;
    }
    try {
      if (this.isGemini) {
         const ai = new GoogleGenAI({ apiKey: this.apiKey });
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
    } catch (e) {
      return 'Summary unavailable.';
    }
  }

  async generateTenMinutePlan(ctx: OnboardingContext): Promise<any> {
    if (!this.isConfigured || !this.prompts?.tenMinute) return {
      steps: [
        { type: 'calm', text: 'Please add your OPENAI_API_KEY or GEMINI_API_KEY to the .env file to enable the real AI 10-minute coach.' },
        { type: 'calm', text: 'Currently running in fallback mode with no API key.' }
      ]
    };

    let prompt = this.prompts.tenMinute
      .replace('{{visa_type}}', ctx.profile?.visaType || 'F1')
      .replace('{{language}}', ctx.profile?.preferredLanguage || 'English');

    const plan = await this.callLlmJson(prompt, this.prompts.system);
    
    if (!plan || !plan.steps) {
      this.logger.warn('LLM failed to generate a valid 10-minute plan. Returning fallback.');
      return {
        steps: [
          { type: 'calm', text: 'Take a deep breath. You are prepared and have all the necessary information.' },
          { type: 'documents', text: '- Passport\n- Visa Approval Notice\n- Supporting evidence' },
          { type: 'questions', questions: [
            { q: 'What is the purpose of your visit?', hint: 'Keep it concise and factual.' },
            { q: 'How long will you stay?', hint: 'Match the dates on your itinerary.' }
          ]},
          { type: 'dos_donts', dos: ['Answer only the question asked', 'Stay calm and polite'], donts: ['Offer unsolicited information', 'Argue with the officer'] },
          { type: 'confidence', text: 'You have a strong case. Stay confident and you will be fine!' }
        ]
      };
    }
    
    return plan;
  }

  async evaluateAirportRisk(ctx: OnboardingContext, issueType: string, contextString: string): Promise<any> {
    if (!this.isConfigured || !this.prompts?.risk) return { risk_level: 'LOW' };

    const prompt = `Input:\n- issue_type: ${issueType}\n- context: ${contextString}\n\n${this.prompts.risk}`;
    return this.callLlmJson(prompt, this.prompts.system);
  }

  private async callLlmJson(userPrompt: string, systemPrompt: string): Promise<any> {
    try {
      if (this.isGemini) {
        const ai = new GoogleGenAI({ apiKey: this.apiKey });
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
      } else {
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
    } catch (e) {
      this.logger.error('callLlmJson error', e);
      return null;
    }
  }

  detectPhase(ctx: Partial<OnboardingContext>): OnboardingPhase {
    return detectPhase(ctx);
  }

  private getStructuredFallback(ctx: OnboardingContext, message: string): OrchestratorResponse {
    const phase = ctx.phase;

    if (phase === 'MEMBER_PROFILE' || phase === 'LEGAL_PROFILE') {
      const isMember = phase === 'MEMBER_PROFILE';
      const missingFields = isMember 
        ? REQUIRED_MEMBER_FIELDS.filter((f) => !ctx.profile?.[f as keyof typeof ctx.profile])
        : REQUIRED_LEGAL_FIELDS.filter((f) => !ctx.legalProfile?.[f as keyof typeof ctx.legalProfile]);
      
      const fieldLabels: Record<string, string> = {
        passportNumber: 'your passport number',
        nationality: 'your nationality / country of citizenship',
        countryOfResidence: 'your country of residence',
        visaType: 'your current visa type (e.g. F-1, H-1B, B-2)',
        currentVisaStatus: 'your current visa status (valid, expired, etc.)',
        visaExpiry: 'your visa expiry date',
        currentEmployer: 'your current employer',
      };
      
      if (missingFields.length === 0) {
        // Detect the correct next phase
        const nextPhase = detectPhase(ctx);
        if (nextPhase === 'LEGAL_PROFILE') {
          return {
            message: `Your basic profile is complete. Let's collect your legal and immigration details now.`,
            nextAction: 'NONE',
            phase: 'LEGAL_PROFILE',
          };
        } else if (nextPhase === 'CASE_CREATION') {
          return {
            message: `Your profiles are complete. What type of immigration case can I help you start today? (e.g., Visa Processing, Work Permit, Citizenship)`,
            nextAction: 'NONE',
            phase: 'CASE_CREATION',
          };
        } else if (nextPhase === 'DOCUMENTS') {
          return {
            message: `Your profiles are complete. Next, we need you to upload some required documents.`,
            nextAction: 'NONE',
            phase: 'DOCUMENTS',
          };
        } else {
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

      // Try to extract a value from the user's message for the previous field question
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
          } else {
            // Last required field answered — save it and signal phase advance
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
      };
    }

    if (phase === 'CASE_CREATION') {
      const lowerMsg = message.toLowerCase().trim();
      let detectedType = '';
      if (lowerMsg.includes('visa')) detectedType = 'VISA_PROCESSING';
      else if (lowerMsg.includes('work')) detectedType = 'WORK_PERMIT';
      else if (lowerMsg.includes('student') || lowerMsg.includes('study')) detectedType = 'STUDY_PERMIT';
      else if (lowerMsg.includes('family')) detectedType = 'FAMILY_SPONSORSHIP';
      else if (lowerMsg.includes('citizen')) detectedType = 'CITIZENSHIP';
      
      if (detectedType) {
        return {
          message: `Great, I will set up a ${detectedType.replace('_', ' ')} case for you. Let's proceed.`,
          nextAction: 'UPDATE_CASE_TYPE',
          fieldToSave: { field: 'caseType', value: detectedType },
          phase: 'CASE_CREATION',
        };
      } else {
        return {
          message: `I can help you with Visa Processing, Work Permits, Study Permits, Family Sponsorship, or Citizenship. Which one do you need?`,
          nextAction: 'NONE',
          phase: 'CASE_CREATION',
          options: ['Visa Processing', 'Work Permit', 'Study Permit', 'Citizenship'],
        };
      }
    }

    if (phase === 'DOCUMENTS') {
      const lowerMsg = message.toLowerCase().trim();

      if (lowerMsg.includes('uploaded') || lowerMsg.includes('here it is') || ctx.uploadedDocuments?.length > 0) {
        return {
          message: `Thank you for uploading the document. Based on your profile and this Legal Notice to Depart, I have logged this as a high-priority incident and forwarded everything to your assigned legal team for immediate review. Let's schedule a consultation to discuss the next steps in detail.`,
          nextAction: 'SCHEDULE_CONSULTATION',
          phase: 'ACTIVE',
          appointmentDetails: { type: 'CONSULTATION', scheduledAt: new Date(Date.now() + 86400000).toISOString() }
        };
      }

      return {
        message: `Your profile is complete. Please upload your Legal Notice to Depart or any relevant evidence to proceed. Use the upload button below.`,
        nextAction: 'UPLOAD_DOCUMENT',
        suggestedDocuments: ['NOTICE'],
        phase: 'DOCUMENTS',
        options: ['I have uploaded it', 'I need help with this document'],
        timelineEvent: {
          type: 'DOCUMENT_REQUESTED',
          title: 'Legal Notice Upload Required',
          description: `Please upload the Notice to Depart for analysis.`,
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
    
    if (lowerMsg.includes('schedule') || lowerMsg.includes('consultation') || lowerMsg.includes('appointment')) {
      if (lowerMsg.includes('initial') || lowerMsg.includes('follow-up')) {
         const type = lowerMsg.includes('follow-up') ? 'FOLLOW_UP' : 'CONSULTATION';
         const date = new Date();
         date.setDate(date.getDate() + 2);
         date.setHours(10, 0, 0, 0);
         return {
           message: `I've initiated the scheduling process for your ${type.replace('_', ' ')}. It is tentatively set for ${date.toLocaleDateString()} at 10:00 AM.`,
           nextAction: 'SCHEDULE_CONSULTATION',
           appointmentDetails: { type, scheduledAt: date.toISOString() },
           phase: 'ACTIVE',
         };
      } else {
        return {
          message: `I can help you schedule a consultation with your lawyer. Would you like an initial consultation or a follow-up?`,
          options: ['Initial Consultation', 'Follow-up Consultation'],
          nextAction: 'NONE',
          phase: 'ACTIVE',
        };
      }
    }

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

  async transcribeAudio(buffer: Buffer, filename: string): Promise<string> {
    if (!this.apiKey) {
      this.logger.warn('No API key configured for audio transcription. Returning dummy text.');
      return "This is a simulated voice transcription because the API key is missing.";
    }

    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(buffer)], { type: 'audio/webm' }); // Browsers usually record webm
      formData.append('file', blob, filename || 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData as any
      });

      if (!response.ok) {
        const err = await response.text();
        this.logger.error(`Whisper API error: ${response.status} - ${err}`);
        throw new Error('Failed to transcribe audio.');
      }

      const data = await response.json();
      return data.text || '';
    } catch (e) {
      this.logger.error('Error transcribing audio:', e);
      throw e;
    }
  }

  async synthesizeSpeechStream(text: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('No API key configured for speech synthesis.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: text,
          response_format: 'mp3'
        })
      });

      if (!response.ok) {
        const err = await response.text();
        this.logger.error(`Speech API error: ${response.status} - ${err}`);
        throw new Error('Failed to synthesize speech.');
      }

      return response.body;
    } catch (e) {
      this.logger.error('Error synthesizing speech:', e);
      throw e;
    }
  }
}
