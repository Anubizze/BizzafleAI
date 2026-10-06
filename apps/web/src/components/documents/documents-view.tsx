"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet } from "@/components/ui/sheet";
import { documentsApi } from "@/lib/api/documents";
import { DEMO_ANALYSIS, DEMO_DOCUMENTS } from "@/lib/demo-data";
import { ApiError } from "@/lib/api/client";
import { formatBytes, formatDate } from "@/lib/utils";
import type { DocumentAnalysis, DocumentCategory, DocumentItem, RiskLevel } from "@bizaffle/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const categories: { id: DocumentCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "Все" },
  { id: "CONTRACT", label: "Договоры" },
  { id: "INVOICE", label: "Счета" },
  { id: "ACT", label: "Акты" },
  { id: "TAX", label: "Налоги" },
  { id: "HR", label: "Кадры" },
  { id: "OTHER", label: "Другое" },
];

const riskTone: Record<RiskLevel, "ok" | "warn" | "danger"> = {
  LOW: "ok",
  MEDIUM: "warn",
  HIGH: "danger",
};

export function DocumentsView() {
  const qc = useQueryClient();
  const [category, setCategory] = useState<DocumentCategory | "ALL">("ALL");
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["documents", category],
    queryFn: () => documentsApi.list(category === "ALL" ? undefined : category),
    retry: 0,
  });

  const upload = useMutation({
    mutationFn: ({ file, cat }: { file: File; cat: DocumentCategory }) =>
      documentsApi.upload(file, cat),
    onSuccess: () => {
      toast.success("Документ загружен");
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Не удалось загрузить"),
  });

  const analyze = useMutation({
    mutationFn: (id: string) => documentsApi.analyze(id),
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success("Проверка завершена");
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => {
      setAnalysis(DEMO_ANALYSIS);
      toast.success("Демо-анализ договора готов");
    },
  });

  function onDrop(files: FileList | null) {
    if (!files?.[0]) return;
    upload.mutate({ file: files[0], cat: category === "ALL" ? "OTHER" : category });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Документы</p>
        <h1 className="display mt-2 text-5xl">Архив, который читает юрист</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              category === c.id ? "border-accent bg-accent-soft" : "border-line"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onDrop(e.dataTransfer.files);
        }}
        className="grid cursor-pointer place-items-center rounded-[18px] border border-dashed border-line px-6 py-12 text-center"
      >
        <p className="display text-3xl">Перетащите файл</p>
        <p className="mt-2 text-sm text-ink-muted">PDF, DOCX, XLSX, JPG, PNG</p>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          onChange={(e) => onDrop(e.target.files)}
        />
      </label>
      {(() => {
        const docs = (list.data && list.data.length ? list.data : DEMO_DOCUMENTS).filter((doc) =>
          category === "ALL" ? true : doc.category === category,
        );
        return (
          <div className="overflow-hidden rounded-[18px] border border-line">
            <table className="w-full text-sm">
              <thead className="bg-canvas-muted/50 text-left text-ink-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Тип</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Размер</th>
                  <th className="px-4 py-3 font-medium">AI</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {docs.map((doc: DocumentItem) => (
                  <tr key={doc.id} className="border-t border-line">
                    <td className="px-4 py-3">{doc.name}</td>
                    <td className="px-4 py-3 text-ink-muted">{doc.category}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(doc.uploadedAt)}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatBytes(doc.size)}</td>
                    <td className="px-4 py-3">
                      <Badge>{doc.aiStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        loading={analyze.isPending}
                        onClick={() => analyze.mutate(doc.id)}
                      >
                        Проверить с AI
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
      <Sheet open={Boolean(analysis)} onClose={() => setAnalysis(null)} title="Анализ документа">
        {analysis ? (
          <div className="space-y-5">
            <Badge tone={riskTone[analysis.riskLevel]}>Риск {analysis.riskLevel}</Badge>
            <p>{analysis.summary}</p>
            <Block title="Риски" items={analysis.risks} />
            <Block title="Обязательства" items={analysis.obligations} />
            <Block title="Штрафы" items={analysis.penalties} />
            <Block title="Сроки" items={analysis.deadlines} />
            <Block title="Платежи" items={analysis.payments} />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">Рекомендации</p>
              <ul className="mt-2 space-y-2 text-sm text-ink-muted">
                {analysis.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Sheet>
      <ConfirmDialog
        open={Boolean(removeId)}
        onClose={() => setRemoveId(null)}
        title="Удалить документ?"
        description="Файл исчезнет из архива компании."
        danger
        onConfirm={async () => {
          if (!removeId) return;
          try {
            await documentsApi.remove(removeId);
            toast.success("Удалено");
            qc.invalidateQueries({ queryKey: ["documents"] });
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Не удалось удалить");
          }
          setRemoveId(null);
        }}
      />
    </div>
  );
}

function Block({
  title,
  items,
}: {
  title: string;
  items: { title: string; detail: string; clause?: string }[];
}) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item.title} className="rounded-[12px] border border-line px-3 py-2">
            <p className="text-sm">{item.title}</p>
            <p className="text-sm text-ink-muted">{item.detail}</p>
            {item.clause ? <p className="mt-1 text-xs text-ink-faint">п. {item.clause}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
