"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-[16px] border border-line bg-canvas-elevated px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none transition duration-200 focus:border-accent/50",
        className,
      )}
      {...props}
    />
  );
});
