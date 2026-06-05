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
  phase?: OnboardingPhase;
}

export type OnboardingPhase = 'MEMBER_PROFILE' | 'LEGAL_PROFILE' | 'DOCUMENTS' | 'REVIEW' | 'ACTIVE';

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
    const missingMemberFields = REQUIRED_MEMBER_FIELDS.filter(
      (f) => !ctx.profile?.[f as keyof typeof ctx.profile],
    );
    const missingLegalFields = REQUIRED_LEGAL_FIELDS.filter(
      (f) => !ctx.legalProfile?.[f as keyof typeof ctx.legalProfile],
    );
    const missingDocs = (ctx.requiredDocuments || REQUIRED_DOCUMENTS).filter(
      (d) => !ctx.uploadedDocuments?.includes(d),
    );

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
- ACTIVE phase: Full case orchestration — appointments, court dates, status updates, lawyer communication.

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
          // If OpenAI quota exceeded (429) or other API errors, fallback to local logic
          if (response.status === 429) {
            // Do not log noisy quota error, just use structured fallback
            return this.getStructuredFallback(ctx, userMessage);
          }
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
