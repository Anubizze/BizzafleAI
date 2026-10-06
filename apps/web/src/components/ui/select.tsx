"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-12 w-full appearance-none rounded-[14px] border border-line bg-canvas-elevated px-4 text-[15px] text-ink outline-none transition duration-200 focus:border-accent/50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
