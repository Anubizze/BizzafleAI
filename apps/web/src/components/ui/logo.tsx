import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({
  href = "/",
  compact = false,
  variant = "nav",
  className,
}: {
  href?: string;
  compact?: boolean;
  variant?: "nav" | "mark" | "lockup";
  className?: string;
}) {
  const markOnly = compact || variant === "mark";

  if (variant === "lockup") {
    return (
      <Link href={href} className={cn("inline-flex flex-col items-start", className)}>
        <span className="relative block overflow-hidden rounded-[18px] bg-[#05060a] shadow-[0_20px_50px_-28px_rgba(80,70,220,0.55)] ring-1 ring-white/10">
          <img
            src="/brand/logo.png"
            alt="Bizaffle AI"
            className="h-[148px] w-[148px] object-cover object-center sm:h-[168px] sm:w-[168px]"
          />
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-[#07080d] ring-1 ring-white/10">
        <img
          src="/brand/logo.png"
          alt=""
          className="h-[168%] w-[168%] object-cover object-[center_18%]"
        />
      </span>
      {markOnly ? (
        <span className="sr-only">Bizaffle AI</span>
      ) : (
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight">
            Bizaffle <span className="font-medium text-ink-muted">AI</span>
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.16em] text-ink-faint sm:block">
            Business. Safer. Smarter.
          </span>
        </span>
      )}
    </Link>
  );
}
