export type AgentSlugName = 'accountant' | 'lawyer' | 'consultant' | 'team';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatParams {
  agentSlug: AgentSlugName;
  messages: ChatMessage[];
  companyContext?: Record<string, unknown>;
}

export interface TeamChatResult {
  accountant: string;
  lawyer: string;
  consultant: string;
  summary: string;
}

export interface AnalysisFinding {
  title: string;
  detail: string;
  clause?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DocumentAnalysisResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  risks: AnalysisFinding[];
  obligations: AnalysisFinding[];
  penalties: AnalysisFinding[];
  deadlines: AnalysisFinding[];
  payments: AnalysisFinding[];
  recommendations: string[];
}

export interface AIProvider {
  chat(params: ChatParams): Promise<string>;
  chatTeam(params: ChatParams): Promise<TeamChatResult>;
  analyzeDocument(params: { text: string; fileName: string }): Promise<DocumentAnalysisResult>;
}
