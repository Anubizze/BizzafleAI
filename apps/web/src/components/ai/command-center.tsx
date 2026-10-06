"use client";

import { AidanaAvatar, type AidanaAvatarHandle } from "@/components/ai/aidana-avatar";
import { ChatView } from "@/components/ai/chat-view";
import { useRef } from "react";

export function CommandCenter({ preset }: { preset?: string }) {
  const avatar = useRef<AidanaAvatarHandle>(null);

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr]">
      <AidanaAvatar ref={avatar} className="lg:sticky lg:top-4 lg:max-h-[calc(100dvh-7rem)]" />
      <ChatView
        agent="accountant"
        preset={preset}
        onAssistant={(text) => avatar.current?.speak(text)}
      />
    </div>
  );
}
