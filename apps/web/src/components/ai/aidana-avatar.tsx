"use client";

import { Button } from "@/components/ui/button";
import { aiApi, type AvatarSession } from "@/lib/api/ai";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type AidanaAvatarHandle = {
  speak: (text: string) => Promise<void>;
};

type Status = "idle" | "connecting" | "live" | "talking";

function toSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#>*_`]/g, "")
    .replace(/\|/g, " ")
    .replace(/---[\s\S]*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}

export const AidanaAvatar = forwardRef<AidanaAvatarHandle, { className?: string }>(
  function AidanaAvatar({ className }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const avatarRef = useRef<import("@heygen/streaming-avatar").default | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const sessionRef = useRef<AvatarSession | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [note, setNote] = useState("Айдана");
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);

    async function start() {
      if (status === "live" || status === "talking") return;
      setStatus("connecting");
      setNote("Подключаем Айдану…");
      try {
        const session = await aiApi.avatarSession();
        sessionRef.current = session;
        if (session.provider === "ravatar" && session.streamingUrl) {
          setIframeUrl(session.streamingUrl);
          if (session.wsUrl) {
            const ws = new WebSocket(session.wsUrl);
            wsRef.current = ws;
          }
          setStatus("live");
          setNote("Ravatar Live");
          return;
        }
        if (session.provider === "heygen" && session.token) {
          const { default: StreamingAvatar, AvatarQuality, StreamingEvents } = await import(
            "@heygen/streaming-avatar"
          );
          const avatar = new StreamingAvatar({ token: session.token });
          avatar.on(StreamingEvents.STREAM_READY, (event: { detail?: MediaStream }) => {
            if (videoRef.current && event.detail) {
              videoRef.current.srcObject = event.detail;
              void videoRef.current.play().catch(() => undefined);
            }
            setStatus("live");
            setNote("Слушает и готова ответить");
          });
          avatar.on(StreamingEvents.AVATAR_START_TALKING, () => setStatus("talking"));
          avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => setStatus("live"));
          await avatar.createStartAvatar({
            quality: AvatarQuality.Low,
            avatarName: session.avatarId || "Ann_Therapist_public",
            language: "ru",
          });
          avatarRef.current = avatar;
          setStatus("live");
          setNote("HeyGen");
          return;
        }
        setStatus("live");
        setNote("Готова ответить");
      } catch {
        sessionRef.current = { provider: "local", name: "Айдана", language: "ru" };
        setStatus("live");
        setNote("Готова ответить");
      }
    }

    async function stop() {
      try {
        await avatarRef.current?.stopAvatar();
      } catch {
        /* closed */
      }
      avatarRef.current = null;
      wsRef.current?.close();
      wsRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setIframeUrl(null);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      setStatus("idle");
      setNote("Включите Айдану");
    }

    useImperativeHandle(ref, () => ({
      speak: async (text: string) => {
        const speech = toSpeech(text);
        if (!speech) return;
        const session = sessionRef.current;
        if (session?.provider === "ravatar" && wsRef.current?.readyState === WebSocket.OPEN) {
          setStatus("talking");
          wsRef.current.send(
            JSON.stringify({
              avatar_id: session.avatarId,
              user_id: session.userId,
              chat_type: "text",
              language: "ru",
              request: speech,
              requestType: "text",
              source: "bizaffle-ai",
              isLive: true,
              LicenseId: session.licenseId,
              session: session.session,
            }),
          );
          return;
        }
        if (avatarRef.current) {
          try {
            const { TaskType } = await import("@heygen/streaming-avatar");
            setStatus("talking");
            await avatarRef.current.speak({ text: speech, taskType: TaskType.REPEAT });
            setStatus("live");
            return;
          } catch {
            /* local */
          }
        }
        if (typeof window !== "undefined" && window.speechSynthesis) {
          setStatus("talking");
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(speech);
          utter.lang = "ru-RU";
          utter.onend = () => setStatus("live");
          window.speechSynthesis.speak(utter);
        }
      },
    }));

    useEffect(() => {
      void start();
      return () => {
        void avatarRef.current?.stopAvatar().catch(() => undefined);
        wsRef.current?.close();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showStream = Boolean(iframeUrl || (status !== "idle" && videoRef.current?.srcObject));

    return (
      <aside className={cn("flex flex-col overflow-hidden rounded-[18px] border border-line bg-canvas-elevated", className)}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0b0b10] lg:aspect-auto lg:min-h-[520px] lg:flex-1">
          <img
            src="/brand/aidana.jpg"
            alt="Айдана"
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-[center_20%] transition-opacity",
              iframeUrl ? "opacity-0" : "opacity-100",
              status === "talking" && "scale-[1.02]",
            )}
          />
          {iframeUrl ? (
            <iframe
              title="Ravatar"
              src={iframeUrl}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; microphone; camera"
            />
          ) : null}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={cn("absolute inset-0 h-full w-full object-cover", iframeUrl || !showStream ? "opacity-0" : "opacity-100")}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-5 pt-16">
            <p className="display text-4xl text-white">Айдана</p>
            <p className="mt-1 text-sm text-white/70">Бухгалтер · Юрист · Консультант</p>
          </div>
        </div>
        <div className="border-t border-line p-4">
          <p className="text-sm text-ink-muted">
            {status === "talking" ? "Говорит" : status === "connecting" ? "Подключаем…" : note}
          </p>
          <div className="mt-3 flex gap-2">
            {status === "idle" ? (
              <Button variant="accent" className="flex-1" onClick={() => void start()}>
                Включить Айдану
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" onClick={() => void stop()} disabled={status === "connecting"}>
                Остановить
              </Button>
            )}
          </div>
        </div>
      </aside>
    );
  },
);
