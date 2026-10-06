"use client";

import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminTable({
  title,
  loading,
  error,
  onRetry,
  columns,
  rows,
}: {
  title: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  if (loading) return <Skeleton className="h-64" />;
  if (error) return <ErrorState onRetry={onRetry} />;

  return (
    <div>
      <h1 className="display text-5xl">{title}</h1>
      <div className="mt-8 overflow-hidden rounded-[16px] border border-line">
        <table className="w-full text-sm">
          <thead className="bg-canvas-muted/50 text-left text-ink-faint">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-ink-muted" colSpan={columns.length}>
                  Нет данных
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-t border-line">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
