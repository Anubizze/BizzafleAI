import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[14px] bg-[color-mix(in_oklab,var(--fg)_8%,transparent)]",
        className,
      )}
    />
  );
}
