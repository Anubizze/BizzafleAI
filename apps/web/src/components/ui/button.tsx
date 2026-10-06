"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-ink text-canvas hover:opacity-90 dark:bg-ink dark:text-canvas",
  accent:
    "bg-accent text-white hover:brightness-110 shadow-[0_12px_30px_-18px_var(--accent)]",
  outline:
    "border border-line bg-transparent text-ink hover:bg-canvas-muted/60",
  ghost: "text-ink hover:bg-canvas-muted/70",
  subtle: "bg-canvas-muted text-ink hover:bg-canvas-muted/80",
  danger: "bg-danger text-white hover:brightness-110",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[14px] font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
