"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-[14px] border border-line bg-canvas-elevated px-4 text-[15px] text-ink placeholder:text-ink-faint outline-none transition duration-200 focus:border-accent/50",
          className,
        )}
        {...props}
      />
    );
  },
);
