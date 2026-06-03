import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('OPENAI_API_KEY') ||
      this.configService.get<string>('GEMINI_API_KEY') ||
      '';
  }

  private get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private buildSystemPrompt(context: any): string {
    return `You are Jana AI — a calm, professional immigration workflow orchestrator for ImmiAssist. 
You are NOT a chatbot. You are an AI orchestrator that guides users through immigration workflows.

RULES:
- Never give specific legal advice. Always say "consult your assigned lawyer."
- Be calm, empathetic, structured, and professional.
- Always respond in structured JSON format matching the OrchestratorResponse schema.
- Guide users step by step through the immigration process.
- If a document is missing, mention it and suggest upload.
- Keep responses concise and actionable.

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}

RESPONSE FORMAT (strict JSON):
{
  "message": "Your message to the user",
  "options": ["Option 1", "Option 2"],
  "nextAction": "ACTION_KEY",
  "caseStatus": "CURRENT_STATUS",
  "timelineEvent": {
    "type": "EVENT_TYPE",
    "title": "Event Title",
    "description": "Event description"
  },
  "suggestedDocuments": ["PASSPORT", "VISA"]
}`;
  }

  async orchestrate(context: any, userMessage: string): Promise<OrchestratorResponse> {
    if (!this.isConfigured) {
      return this.getMockOrchestration(userMessage, context);
    }

    try {
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
            { role: 'system', content: this.buildSystemPrompt(context) },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.4,
        }),
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || '';
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    } catch (error) {
      this.logger.error('AI API error', error);
      return this.getMockOrchestration(userMessage, context);
    }
  }

  async summarizeCase(caseData: any): Promise<string> {
    if (!this.isConfigured) {
      return `Case ${caseData.caseNumber}: ${caseData.caseType?.replace(/_/g, ' ')} — Status: ${caseData.status?.replace(/_/g, ' ')}. ${caseData.detail?.notes || 'Ongoing immigration assistance case.'}`;
    }

    try {
      const prompt = `Summarize this immigration case in 2-3 sentences for a lawyer dashboard: ${JSON.stringify(caseData)}`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a legal case summarizer. Be concise and professional.' },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const data = await response.json();
      return data?.choices?.[0]?.message?.content || 'Summary unavailable.';
    } catch {
      return 'Summary unavailable.';
    }
  }

  private getMockOrchestration(message: string, context: any): OrchestratorResponse {
    const lower = message.toLowerCase();
    const status = context?.caseStatus || context?.status || 'NEW';

    // Intake flow
    if (lower.includes('visa') || lower.includes('help') || lower.includes('start') || status === 'NEW') {
      return {
        message: `Hello! I'm Jana AI, your immigration case orchestrator. I'll guide you through every step of your case.\n\nTo get started, I need to understand your immigration need. What type of assistance are you looking for?`,
        options: [
          '🛂 Visa Processing / Status Change',
          '📋 Work Permit Application',
          '🎓 Study Permit',
          '👨‍👩‍👧 Family Sponsorship',
          '🏛️ Court / Deportation Defense',
          '🌍 Citizenship Application',
        ],
        nextAction: 'SELECT_CASE_TYPE',
        caseStatus: 'NEW',
        timelineEvent: {
          type: 'CASE_CREATED',
          title: 'Case Intake Started',
          description: 'Jana AI has started the intake process.',
        },
      };
    }

    if (lower.includes('document') || lower.includes('upload') || status === 'DOCUMENTS_PENDING') {
      return {
        message: `To proceed with your case, I need the following documents. You can upload them using the document panel on the right.\n\nOnce all required documents are received, your legal associate will begin the review process.`,
        options: ['📎 Upload Documents Now', '❓ Which documents do I need?', '⏭️ Skip for now'],
        nextAction: 'UPLOAD_DOCUMENTS',
        caseStatus: 'DOCUMENTS_PENDING',
        suggestedDocuments: ['PASSPORT', 'VISA', 'I20', 'EMPLOYMENT_LETTER'],
        timelineEvent: {
          type: 'DOCUMENT_REQUESTED',
          title: 'Documents Requested',
          description: 'Jana AI has identified required documents for this case.',
        },
      };
    }

    if (lower.includes('appointment') || lower.includes('consult') || lower.includes('meet')) {
      return {
        message: `Your lawyer is ready to schedule a consultation. The appointment will be virtual via the meeting link provided.\n\n📅 You can view your upcoming appointments in the dashboard. Your lawyer will confirm the time shortly.`,
        options: ['✅ Confirm Appointment', '🔄 Request Different Time', '💬 Message Lawyer'],
        nextAction: 'CONFIRM_APPOINTMENT',
        caseStatus: 'CONSULTATION_SCHEDULED',
        timelineEvent: {
          type: 'APPOINTMENT_SCHEDULED',
          title: 'Consultation Requested',
          description: 'Member requested a consultation appointment.',
        },
      };
    }

    if (lower.includes('court') || lower.includes('hearing')) {
      return {
        message: `⚖️ A court date has been associated with your case. Your assigned lawyer, ${context?.lawyer?.name || 'your counsel'}, will represent you.\n\nPlease ensure all required documents are uploaded and reviewed before the hearing date.`,
        options: ['📋 View Court Details', '📎 Upload Court Documents', '💬 Speak to Lawyer'],
        nextAction: 'VIEW_COURT_DATE',
        caseStatus: 'COURT_DATE_ASSIGNED',
        timelineEvent: {
          type: 'COURT_DATE_ASSIGNED',
          title: 'Court Date Assigned',
          description: 'A court hearing has been scheduled for this case.',
        },
      };
    }

    if (lower.includes('status') || lower.includes('update') || lower.includes('progress')) {
      return {
        message: `📊 Here's the current status of your case:\n\n**Status:** ${status?.replace(/_/g, ' ')}\n**Case:** ${context?.caseNumber || 'Active Case'}\n\nYour legal team is actively working on your case. You'll receive notifications for every update.`,
        options: ['📂 View Documents', '📅 View Appointments', '📊 View Full Timeline'],
        nextAction: 'VIEW_STATUS',
        caseStatus: status,
      };
    }

    // Default orchestrator response
    return {
      message: `I understand you need assistance. Your case is currently under active management by your legal team.\n\nAs your AI orchestrator, I can help you:\n• Upload and track documents\n• Schedule consultations\n• Monitor case progress\n• Answer process questions\n\nWhat would you like to do?`,
      options: ['📎 Upload Documents', '📅 Schedule Consultation', '📊 Check Case Status', '🔔 View Notifications'],
      nextAction: 'MENU',
      caseStatus: status,
    };
  }
}
