"use client";

import { Button } from "@/components/ui/button";
import { notificationsApi } from "@/lib/api/notifications";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function NotificationsView() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["notifications"], queryFn: notificationsApi.list, retry: 0 });
  const items = list.data?.length ? list.data : DEMO_NOTIFICATIONS;
  const readAll = useMutation({
    mutationFn: notificationsApi.markAll,
    onSuccess: () => {
      toast.success("Все прочитаны");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Уведомления</p>
          <h1 className="display mt-2 text-5xl">Сигналы</h1>
        </div>
        <Button variant="outline" onClick={() => readAll.mutate()}>
          Прочитать все
        </Button>
      </div>
      <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={async () => {
                if (!item.read) {
                  await notificationsApi.markRead(item.id);
                  qc.invalidateQueries({ queryKey: ["notifications"] });
                }
              }}
              className={`w-full rounded-[16px] border border-line px-5 py-4 text-left ${
                item.read ? "opacity-60" : "bg-canvas-elevated"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">{item.type}</p>
              <p className="mt-1">{item.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
              <p className="mt-2 text-xs text-ink-faint">{formatDate(item.createdAt, { hour: "2-digit", minute: "2-digit" })}</p>
            </button>
          ))}
        </div>
    </div>
  );
}
