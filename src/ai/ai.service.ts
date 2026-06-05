import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface OrchestratorResponse {
  message: string;
  options?: string[];
  nextAction?: string;
  fieldToSave?: { field: string; value: string };
  caseStatus?: string;
  timelineEvent?: { type: string; title: string; description: string };
  suggestedDocuments?: string[];
  phase?: 'PROFILE' | 'DOCUMENTS' | 'REVIEW' | 'ACTIVE';
}

export type OnboardingPhase = 'PROFILE' | 'DOCUMENTS' | 'REVIEW' | 'ACTIVE';

export interface OnboardingContext {
  phase: OnboardingPhase;
  profile: {
    passportNumber?: string | null;
    nationality?: string | null;
    visaType?: string | null;
    visaExpiry?: string | null;
    employerOrUniversity?: string | null;
    preferredLanguage?: string | null;
    emergencyContact?: string | null;
    portOfEntry?: string | null;
  };
  uploadedDocuments: string[];
  requiredDocuments: string[];
  caseType?: string;
  caseStatus?: string;
  caseNumber?: string;
  lawyer?: { name: string };
  messageHistory?: any[];
}

const REQUIRED_PROFILE_FIELDS = [
  'passportNumber',
  'nationality',
  'visaType',
  'visaExpiry',
  'employerOrUniversity',
];

const REQUIRED_DOCUMENTS = ['PASSPORT', 'VISA'];

function detectPhase(ctx: Partial<OnboardingContext>): OnboardingPhase {
  const profile = ctx.profile || {};
  const profileComplete = REQUIRED_PROFILE_FIELDS.every(
    (f) => profile[f as keyof typeof profile],
  );
  if (!profileComplete) return 'PROFILE';

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
    } catch (e) {
      this.logger.error('Failed to load knowledge base', e);
    }
  }

  private get isConfigured(): boolean {
    return this.apiKey.length > 10 && this.apiKey.startsWith('sk-');
  }

  private buildSystemPrompt(ctx: OnboardingContext): string {
    const missingProfileFields = REQUIRED_PROFILE_FIELDS.filter(
      (f) => !ctx.profile?.[f as keyof typeof ctx.profile],
    );
    const missingDocs = (ctx.requiredDocuments || REQUIRED_DOCUMENTS).filter(
      (d) => !ctx.uploadedDocuments?.includes(d),
    );

    return `You are Jana — a senior immigration case orchestrator at ImmiAssist. You are NOT a general chatbot. You follow a strict workflow.

CURRENT PHASE: ${ctx.phase}
CASE: ${ctx.caseNumber || 'New'} | TYPE: ${ctx.caseType || 'Not set'} | STATUS: ${ctx.caseStatus || 'New'}
PROFILE COMPLETION: ${missingProfileFields.length === 0 ? 'Complete' : `Missing: ${missingProfileFields.join(', ')}`}
DOCUMENTS UPLOADED: ${ctx.uploadedDocuments?.join(', ') || 'None'}
MISSING DOCUMENTS: ${missingDocs.join(', ') || 'None'}

PHASE RULES (follow strictly):
- PROFILE phase: Collect missing profile fields one at a time through conversation. For each answer, set nextAction="SAVE_PROFILE_FIELD" and fieldToSave with the field name and value extracted from the user's message.
- DOCUMENTS phase: Profile is complete. Guide the user to upload specific missing documents. Set nextAction="UPLOAD_DOCUMENT" and suggestedDocuments to the missing doc types.
- REVIEW phase: All data collected. Summarise the case and inform the user their legal team will contact them.
- ACTIVE phase: Full case orchestration — appointments, court dates, status updates, lawyer communication.

PROFILE FIELDS AND THEIR FRIENDLY NAMES:
- passportNumber → "Passport number"
- nationality → "Nationality / country of citizenship"
- visaType → "Current visa type (e.g. F-1, H-1B, B-2, etc.)"
- visaExpiry → "Visa expiry date (YYYY-MM-DD)"
- employerOrUniversity → "Current employer or university"
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

  async orchestrate(ctx: OnboardingContext, userMessage: string): Promise<OrchestratorResponse> {
    // Ensure phase is correctly set
    ctx.phase = ctx.phase || detectPhase(ctx);

    if (!this.isConfigured) {
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
        const err = await response.text();
        this.logger.error(`OpenAI error ${response.status}: ${err}`);
        return this.getStructuredFallback(ctx, userMessage);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || '';
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a legal case summariser. Be concise and professional. Two sentences max.' },
            { role: 'user', content: `Summarise this immigration case: ${JSON.stringify(caseData)}` },
          ],
          max_tokens: 120,
        }),
      });
      const data = await response.json();
      return data?.choices?.[0]?.message?.content || 'Summary unavailable.';
    } catch {
      return 'Summary unavailable.';
    }
  }

  detectPhase(ctx: Partial<OnboardingContext>): OnboardingPhase {
    return detectPhase(ctx);
  }

  private getStructuredFallback(ctx: OnboardingContext, message: string): OrchestratorResponse {
    const phase = ctx.phase;

    if (phase === 'PROFILE') {
      const missingFields = REQUIRED_PROFILE_FIELDS.filter(
        (f) => !ctx.profile?.[f as keyof typeof ctx.profile],
      );
      const fieldLabels: Record<string, string> = {
        passportNumber: 'your passport number',
        nationality: 'your nationality / country of citizenship',
        visaType: 'your current visa type (e.g. F-1, H-1B, B-2)',
        visaExpiry: 'your visa expiry date',
        employerOrUniversity: 'your current employer or university',
      };
      
      if (missingFields.length === 0) {
        return {
          message: `Your profile is complete.`,
          nextAction: 'NONE',
          phase: 'PROFILE'
        };
      }

      const nextField = missingFields[0];
      const friendly = fieldLabels[nextField] || nextField;
      const remaining = missingFields.length;

      // Try to extract a value from the user's message for the previous field question
      const lowerMsg = message.toLowerCase().trim();
      // Heuristic: if message is short and informational, treat it as an answer
      const looksLikeAnswer = message.length > 0 && message.length < 120 && !lowerMsg.includes('?');
      
      if (looksLikeAnswer) {
        const nextNextField = missingFields[1];
        if (nextNextField) {
           const nextFriendly = fieldLabels[nextNextField] || nextNextField;
           return {
             message: `Got it. Next, could you please provide ${nextFriendly}? (${remaining - 1} field${remaining - 1 !== 1 ? 's' : ''} remaining)`,
             nextAction: 'SAVE_PROFILE_FIELD',
             fieldToSave: { field: nextField, value: message.trim() },
             phase: 'PROFILE'
           };
        } else {
           return {
             message: `Thank you. Your profile is now complete.`,
             nextAction: 'SAVE_PROFILE_FIELD',
             fieldToSave: { field: nextField, value: message.trim() },
             phase: 'PROFILE'
           };
        }
      }
      
      return {
        message: `Thank you. Could you please provide ${friendly}? (${remaining} field${remaining !== 1 ? 's' : ''} remaining)`,
        nextAction: 'NONE',
        phase: 'PROFILE',
        timelineEvent: {
          type: 'PROFILE_UPDATE',
          title: 'Profile Screening',
          description: `Collecting required profile information.`,
        },
      };
    }

    if (phase === 'DOCUMENTS') {
      const missingDocs = REQUIRED_DOCUMENTS.filter(
        (d) => !ctx.uploadedDocuments?.includes(d),
      );
      const docLabels: Record<string, string> = {
        PASSPORT: 'Passport (bio-data page)',
        VISA: 'Current visa stamp or approval notice',
        I797: 'I-797 Approval Notice',
        I20: 'Form I-20',
        EAD: 'EAD Card',
      };
      const nextDoc = missingDocs[0];
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

    // ACTIVE phase — general orchestration
    return {
      message: `Your case is actively managed by your legal team. How can I assist you today?`,
      options: ['Upload a document', 'Schedule a consultation', 'Check case status', 'View upcoming court dates'],
      nextAction: 'NONE',
      phase: 'ACTIVE',
    };
  }
}
