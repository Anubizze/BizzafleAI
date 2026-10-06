"use client";

import { CommandCenter } from "@/components/ai/command-center";
import { useSearchParams } from "next/navigation";

export default function AgentChatPage() {
  const search = useSearchParams();
  return <CommandCenter preset={search.get("q") ?? undefined} />;
}
