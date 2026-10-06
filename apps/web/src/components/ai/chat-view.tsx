"use client";

import { MarkdownView } from "@/components/ai/markdown-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { aiApi } from "@/lib/api/ai";
import { agentBySlug, suggestedQuestions } from "@/lib/agents";
import { DEMO_AI_REPLY, DEMO_CONVERSATIONS, DEMO_MESSAGES } from "@/lib/demo-data";
import { simulateTokenStream } from "@/lib/stream";
import { cn, fileKind, formatDate } from "@/lib/utils";
import type { AgentSlug, AIConversation, AIMessage, AttachmentMeta } from "@bizaffle/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentSlug?: AgentSlug | null;
  attachments?: AttachmentMeta[];
}

export function ChatView({
  agent,
  preset,
  onAssistant,
}: {
  agent: AgentSlug;
  preset?: string;
  onAssistant?: (text: string) => void | Promise<void>;
}) {
  const meta = agentBySlug(agent);
  const qc = useQueryClient();
  const [conversationId, setConversationId] = useState<string | null>("c1");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(preset ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [streaming, setStreaming] = useState("");
  const [teamReplies, setTeamReplies] = useState<LocalMessage[]>([]);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<LocalMessage[]>([]);
  const dropRef = useRef<HTMLDivElement>(null);

  const history = useQuery({
    queryKey: ["conversations", agent],
    queryFn: () => aiApi.conversations(agent),
    retry: 0,
  });

  const thread = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => aiApi.conversation(conversationId!),
    enabled: Boolean(conversationId),
    retry: 0,
  });

  const filtered = useMemo(() => {
    const list = history.data?.length ? history.data : DEMO_CONVERSATIONS;
    if (!query.trim()) return list;
    return list.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));
  }, [history.data, query]);

  const messages: LocalMessage[] = useMemo(() => {
    const demo = conversationId ? DEMO_MESSAGES[conversationId] ?? [] : [];
    const source = thread.data?.messages?.length ? thread.data.messages : demo;
    const remote = source.map((m) => ({
      id: m.id,
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
      agentSlug: m.agentSlug,
      attachments: m.attachments,
    }));
    return [...remote, ...local];
  }, [thread.data, local, conversationId]);

  function addFiles(list: FileList | File[]) {
    const next = Array.from(list).filter((f) =>
      /\.(pdf|docx?|xlsx?|jpe?g|png)$/i.test(f.name),
    );
    setFiles((prev) => [...prev, ...next]);
  }

  async function send(text = draft) {
    if (!text.trim() && files.length === 0) return;
    const attachments: AttachmentMeta[] = files.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      url: "",
    }));
    const userMsg: LocalMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      attachments,
    };
    setLocal((prev) => [...prev, userMsg]);
    setDraft("");
    setFiles([]);
    setBusy(true);
    setStreaming("");
    setTeamReplies([]);
    setSummary("");

    try {
      const result = await aiApi.ask({
        agentSlug: agent,
        conversationId: conversationId ?? undefined,
        content: text.trim() || "Проверьте вложение",
        attachments,
      });
      if (result.conversation?.id || result.conversationId) {
        setConversationId(result.conversation?.id ?? result.conversationId);
      }
      const full = result.message?.content ?? result.summary ?? "Готово. Уточните вопрос, если нужно.";
      let acc = "";
      for await (const chunk of simulateTokenStream(full)) {
        acc = chunk;
        setStreaming(chunk);
      }
      setStreaming("");
      if (agent === "team" && result.team) {
        setTeamReplies([
          { id: "acc", role: "assistant", content: result.team.accountant, agentSlug: "accountant" },
          { id: "law", role: "assistant", content: result.team.lawyer, agentSlug: "lawyer" },
          { id: "con", role: "assistant", content: result.team.consultant, agentSlug: "consultant" },
        ]);
        setSummary(result.team.summary);
        void onAssistant?.(result.team.summary);
      } else if (agent === "team" && result.replies?.length) {
        setTeamReplies(
          result.replies.map((m: AIMessage) => ({
            id: m.id,
            role: "assistant",
            content: m.content,
            agentSlug: m.agentSlug,
          })),
        );
        setSummary(result.summary ?? acc);
        void onAssistant?.(result.summary ?? acc);
      } else {
        setLocal((prev) => [
          ...prev,
          { id: result.message?.id ?? `a-${Date.now()}`, role: "assistant", content: acc },
        ]);
        void onAssistant?.(acc);
      }
      qc.invalidateQueries({ queryKey: ["conversations", agent] });
    } catch {
      let acc = "";
      for await (const chunk of simulateTokenStream(DEMO_AI_REPLY)) {
        acc = chunk;
        setStreaming(chunk);
      }
      setStreaming("");
      setLocal((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: acc }]);
      void onAssistant?.(acc);
    } finally {
      setBusy(false);
    }
  }

  function newChat() {
    setConversationId(null);
    setLocal([]);
    setStreaming("");
    setTeamReplies([]);
    setSummary("");
  }

  return (
    <div className="grid h-[calc(100dvh-8.5rem)] grid-cols-1 overflow-hidden rounded-[18px] border border-line lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-line lg:flex lg:flex-col">
        <div className="flex items-center gap-2 p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 size-4 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск чатов"
              className="h-11 w-full rounded-[12px] border border-line bg-transparent pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <Button size="sm" variant="subtle" onClick={newChat}>
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filtered.map((c: AIConversation) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setConversationId(c.id);
                  setLocal([]);
                }}
                className={cn(
                  "mb-1 w-full rounded-[12px] px-3 py-2 text-left text-sm hover:bg-canvas-muted",
                  conversationId === c.id && "bg-canvas-muted",
                )}
              >
                <p className="truncate">{c.title}</p>
                <p className="text-xs text-ink-faint">{formatDate(c.updatedAt)}</p>
              </button>
            ))}
        </div>
      </aside>
      <section className="flex min-w-0 flex-col">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Айдана · бухгалтер, юрист, консультант</p>
              <h1 className="display text-3xl">{meta.name === "Команда" ? "Айдана" : meta.name}</h1>
            </div>
            <Button className="lg:hidden" size="sm" variant="outline" onClick={newChat}>
              Новый чат
            </Button>
          </div>
          <p className="mt-3 rounded-[12px] border border-line bg-canvas-muted/40 px-3 py-2 text-xs text-ink-muted">
            Ответы носят справочный характер и не являются официальной консультацией лицензированного
            специалиста.
          </p>
        </div>
        <div
          ref={dropRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          {messages.length === 0 && !streaming ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {suggestedQuestions[agent].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-[14px] border border-line px-4 py-3 text-left text-sm text-ink-muted hover:bg-canvas-muted"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : null}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} onResend={() => send(m.content)} />
          ))}
          {streaming ? (
            <div className="rounded-[16px] border border-line bg-canvas-elevated px-4 py-3">
              <MarkdownView content={streaming} />
            </div>
          ) : null}
          {teamReplies.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-3">
              {teamReplies.map((m) => (
                <div key={m.id} className="rounded-[16px] border border-line p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">
                    {agentBySlug((m.agentSlug as AgentSlug) || "accountant").name}
                  </p>
                  <div className="mt-2">
                    <MarkdownView content={m.content} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {summary ? (
            <div className="rounded-[16px] border border-line bg-canvas-muted/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">Резюме команды</p>
              <div className="mt-2">
                <MarkdownView content={summary} />
              </div>
            </div>
          ) : null}
        </div>
        <div className="border-t border-line p-4">
          {files.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {files.map((file) => (
                <Badge key={file.name}>
                  {fileKind(file.name)} · {file.name}
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <label className="grid size-11 place-items-center rounded-[14px] border border-line">
              <Paperclip className="size-4" />
              <input
                type="file"
                accept={ACCEPT}
                multiple
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </label>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Сообщение для ${meta.name}…`}
              className="min-h-[48px]"
            />
            <Button variant="accent" disabled={busy} onClick={() => send()}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MessageBubble({
  message,
  onResend,
}: {
  message: LocalMessage;
  onResend: () => void;
}) {
  const copy = useMutation({
    mutationFn: async () => navigator.clipboard.writeText(message.content),
    onSuccess: () => toast.success("Скопировано"),
  });

  return (
    <div className={cn("max-w-3xl", message.role === "user" ? "ml-auto" : "")}>
      <div
        className={cn(
          "rounded-[16px] px-4 py-3",
          message.role === "user" ? "bg-canvas-muted" : "border border-line bg-canvas-elevated",
        )}
      >
        {message.attachments?.length ? (
          <div className="mb-2 flex flex-wrap gap-1">
            {message.attachments.map((a) => (
              <Badge key={a.id}>{a.name}</Badge>
            ))}
          </div>
        ) : null}
        {message.role === "assistant" ? (
          <MarkdownView content={message.content} />
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
      {message.role === "assistant" ? (
        <div className="mt-2 flex gap-1 text-ink-faint">
          <button type="button" className="rounded-full p-1.5 hover:bg-canvas-muted" onClick={() => copy.mutate()}>
            <Copy className="size-3.5" />
          </button>
          <button type="button" className="rounded-full p-1.5 hover:bg-canvas-muted" onClick={onResend}>
            <RefreshCw className="size-3.5" />
          </button>
          <button
            type="button"
            className="rounded-full p-1.5 hover:bg-canvas-muted"
            onClick={() => toast.success("Спасибо за оценку")}
          >
            <ThumbsUp className="size-3.5" />
          </button>
          <button
            type="button"
            className="rounded-full p-1.5 hover:bg-canvas-muted"
            onClick={() => toast.success("Приняли, улучшим ответ")}
          >
            <ThumbsDown className="size-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
