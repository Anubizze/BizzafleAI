"use client";

import { Badge } from "@/components/ui/badge";
import { calendarApi } from "@/lib/api/calendar";
import { DEMO_EVENTS } from "@/lib/demo-data";
import type { CalendarEvent, CalendarEventType } from "@bizaffle/types";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const colors: Record<CalendarEventType, string> = {
  TAX: "bg-[#7C5CFF]",
  REPORT: "bg-[#5B8CFF]",
  PAYMENT: "bg-[#C084FC]",
  CONTRACT: "bg-[#E3B341]",
  TASK: "bg-ink-faint",
};

export function CalendarView() {
  const [cursor, setCursor] = useState(new Date());
  const monthKey = format(cursor, "yyyy-MM");
  const events = useQuery({
    queryKey: ["calendar", monthKey],
    queryFn: () => calendarApi.list(monthKey),
    retry: 0,
  });

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const list = events.data?.length ? events.data : DEMO_EVENTS;

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of list) {
      const key = event.date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [list]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Календарь</p>
          <h1 className="display mt-2 text-5xl">{format(cursor, "LLLL yyyy", { locale: ru })}</h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-line px-3 py-1.5 text-sm" onClick={() => setCursor(addMonths(cursor, -1))}>
            Назад
          </button>
          <button className="rounded-full border border-line px-3 py-1.5 text-sm" onClick={() => setCursor(addMonths(cursor, 1))}>
            Далее
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-ink-muted">
        {Object.entries(colors).map(([type, cls]) => (
          <span key={type} className="inline-flex items-center gap-2">
            <span className={`size-2 rounded-full ${cls}`} />
            {type}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[18px] border border-line bg-line">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
            <div key={d} className="bg-canvas-muted px-2 py-2 text-xs text-ink-faint">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const items = byDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={`min-h-24 bg-canvas p-2 ${isSameMonth(day, cursor) ? "" : "opacity-40"}`}
              >
                <p className="text-xs text-ink-faint">{format(day, "d")}</p>
                <div className="mt-1 space-y-1">
                  {items.map((event) => (
                    <p key={event.id} className="truncate text-[11px]">
                      <span className={`mr-1 inline-block size-1.5 rounded-full ${colors[event.type]}`} />
                      {event.title}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      <div className="space-y-2">
          {list.slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-[14px] border border-line px-4 py-3">
              <p>{event.title}</p>
              <Badge>{event.type}</Badge>
            </div>
          ))}
        </div>
    </div>
  );
}
