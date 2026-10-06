import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const tones = {
  default: "bg-canvas-muted text-ink-muted",
  accent: "bg-accent-soft text-accent",
  ok: "bg-[color-mix(in_oklab,var(--ok)_16%,transparent)] text-ok",
  warn: "bg-[color-mix(in_oklab,var(--warn)_16%,transparent)] text-warn",
  danger: "bg-[color-mix(in_oklab,var(--danger)_16%,transparent)] text-danger",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
