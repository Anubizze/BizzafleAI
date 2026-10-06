export type Locale = "ru" | "kk" | "en";

export type Role = "USER" | "COMPANY_ADMIN" | "ADMIN";

export type BusinessType = "IP" | "TOO" | "OTHER";

export type TaxRegime =
  | "SIMPLIFIED"
  | "GENERAL"
  | "PATENT"
  | "RETAIL_TAX"
  | "OTHER";

export type SubscriptionPlan = "START" | "BUSINESS" | "PRO";

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED";

export type AgentSlug = "accountant" | "lawyer" | "consultant" | "team";

export type MessageRole = "user" | "assistant" | "system";

export type DocumentCategory =
  | "CONTRACT"
  | "INVOICE"
  | "ACT"
  | "TAX"
  | "HR"
  | "OTHER";

export type DocumentAiStatus = "PENDING" | "CHECKED" | "RISKS" | "ATTENTION";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type CalendarEventType =
  | "TAX"
  | "REPORT"
  | "PAYMENT"
  | "CONTRACT"
  | "TASK";

export type NotificationType =
  | "DEADLINE"
  | "DOCUMENT_RISK"
  | "TAX"
  | "HEALTH"
  | "SYSTEM";

export type PrimaryGoal =
  | "ACCOUNTING"
  | "LEGAL"
  | "MANAGEMENT"
  | "ALL";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  role: Role;
  locale: Locale;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface Company {
  id: string;
  name: string;
  type: BusinessType;
  binIin: string;
  industry: string;
  taxRegime: TaxRegime;
  employeeCount: number;
  registeredAt: string | null;
  primaryGoal: PrimaryGoal;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: Role;
}

export interface AIAgent {
  id: string;
  slug: AgentSlug;
  name: string;
  title: string;
  specialty: string;
  description: string;
  color: string;
}

export interface AIConversation {
  id: string;
  title: string;
  agentSlug: AgentSlug;
  companyId: string;
  userId: string;
  updatedAt: string;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  agentSlug: AgentSlug | null;
  attachments: AttachmentMeta[];
  createdAt: string;
}

export interface AttachmentMeta {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: DocumentCategory;
  mimeType: string;
  size: number;
  aiStatus: DocumentAiStatus;
  uploadedAt: string;
  companyId: string;
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  riskLevel: RiskLevel;
  summary: string;
  risks: AnalysisFinding[];
  obligations: AnalysisFinding[];
  penalties: AnalysisFinding[];
  deadlines: AnalysisFinding[];
  payments: AnalysisFinding[];
  recommendations: string[];
  createdAt: string;
}

export interface AnalysisFinding {
  title: string;
  detail: string;
  clause?: string;
  severity?: RiskLevel;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string;
  amount?: number;
  description?: string;
}

export interface BusinessHealth {
  score: number;
  label: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendations: string[];
}

export interface BusinessMetric {
  id: string;
  month: string;
  income: number;
  expense: number;
}

export interface DashboardOverview {
  greetingName: string;
  health: BusinessHealth;
  taxLiability: number;
  upcomingDeadlines: number;
  documentsCount: number;
  financeBalance: number;
  risksCount: number;
  attention: AttentionItem[];
}

export interface AttentionItem {
  id: string;
  title: string;
  detail: string;
  tone: "warning" | "danger" | "info";
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  periodEnd: string;
}

export interface AdminStats {
  totalUsers: number;
  activeCompanies: number;
  aiRequests: number;
  mrr: number;
}

export const AI_AGENTS: AIAgent[] = [
  {
    id: "accountant",
    slug: "accountant",
    name: "Айдана",
    title: "AI-специалист",
    specialty: "Бухгалтер, юрист и бизнес-консультант",
    description:
      "Один ассистент: налоги, договоры и стратегия для ИП и ТОО в Казахстане.",
    color: "#7C5CFF",
  },
  {
    id: "lawyer",
    slug: "lawyer",
    name: "Айдана",
    title: "Право",
    specialty: "Договоры, риски, законодательство РК",
    description:
      "Разбирает договоры, указывает на риски и объясняет нормы без юридического жаргона.",
    color: "#5B8CFF",
  },
  {
    id: "consultant",
    slug: "consultant",
    name: "Айдана",
    title: "Стратегия",
    specialty: "Unit-экономика и рост",
    description:
      "Считает экономику, предлагает гипотезы роста и держит фокус на прибыльности.",
    color: "#C084FC",
  },
];
