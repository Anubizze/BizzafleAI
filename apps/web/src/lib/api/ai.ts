import type {
  AgentSlug,
  AIAgent,
  AIConversation,
  AIMessage,
  AttachmentMeta,
} from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export interface AskPayload {
  agentSlug: AgentSlug;
  conversationId?: string;
  content: string;
  attachments?: AttachmentMeta[];
}

export interface TeamReply {
  accountant: string;
  lawyer: string;
  consultant: string;
  summary: string;
}

export interface AskResult {
  conversationId: string;
  conversation: AIConversation;
  message: AIMessage;
  userMessage?: AIMessage;
  team?: TeamReply;
  replies?: AIMessage[];
  summary?: string;
}

export interface AvatarSession {
  provider: "ravatar" | "heygen" | "local";
  name: string;
  language: string;
  token?: string;
  avatarId?: string;
  streamingUrl?: string;
  wsUrl?: string;
  licenseId?: string;
  userId?: string;
  session?: string;
  previewUrl?: string;
}
export const aiApi = {
  agents: () => apiClient.get<AIAgent[]>("/ai/agents"),
  conversations: (agentSlug?: AgentSlug) =>
    apiClient.get<AIConversation[]>(
      agentSlug ? `/ai/conversations?agent=${agentSlug}` : "/ai/conversations",
    ),
  conversation: async (id: string) => {
    const data = await apiClient.get<AIConversation & { messages: AIMessage[] }>(
      `/ai/conversations/${id}`,
    );
    return { conversation: data, messages: data.messages ?? [] };
  },
  createConversation: (agentSlug: AgentSlug, title?: string) =>
    apiClient.post<AIConversation>("/ai/conversations", { agentSlug, title }),
  ask: (payload: AskPayload) => apiClient.post<AskResult>("/ai/chat", payload),
  avatarSession: () => apiClient.post<AvatarSession>("/ai/avatar/session"),
};
