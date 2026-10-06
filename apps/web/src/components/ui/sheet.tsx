"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: side === "left" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "left" ? "-100%" : "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute top-0 h-full w-[min(92vw,420px)] border-line bg-canvas-elevated shadow-[var(--shadow-lift)]",
              side === "left" ? "left-0 border-r" : "right-0 border-l",
              className,
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-sm font-medium tracking-wide uppercase text-ink-muted">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-muted hover:bg-canvas-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="h-[calc(100%-57px)] overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
