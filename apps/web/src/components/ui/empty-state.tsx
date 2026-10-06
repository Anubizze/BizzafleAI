import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-dashed border-line px-8 py-14 text-center",
        className,
      )}
    >
      <p className="display text-3xl">{title}</p>
      {description ? <p className="mx-auto mt-3 max-w-md text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
