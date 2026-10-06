"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { setLocale, t, type Locale } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Настройки</p>
        <h1 className="display mt-2 text-5xl">Кабинет под себя</h1>
      </div>
      <section className="space-y-3 rounded-[18px] border border-line p-6">
        <p className="text-sm text-ink-muted">Тема</p>
        <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="dark">Тёмная</option>
          <option value="light">Светлая</option>
        </Select>
      </section>
      <section className="space-y-3 rounded-[18px] border border-line p-6">
        <p className="text-sm text-ink-muted">Язык интерфейса</p>
        <Select
          defaultValue="ru"
          onChange={(e) => {
            setLocale(e.target.value as Locale);
            toast.success("Язык сохранён. Часть строк подхватится сразу.");
          }}
        >
          <option value="ru">Русский</option>
          <option value="kk">Қазақша</option>
          <option value="en">English</option>
        </Select>
        <p className="text-xs text-ink-faint">{t("hero.title")}</p>
      </section>
      <Button variant="outline" onClick={() => toast.success("Настройки сохранены")}>
        Сохранить
      </Button>
    </div>
  );
}
