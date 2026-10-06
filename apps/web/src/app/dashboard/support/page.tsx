"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

export default function SupportPage() {
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Поддержка</p>
        <h1 className="display mt-2 text-5xl">Напишите нам</h1>
        <p className="mt-3 text-ink-muted">
          AI не заменяет специалиста. Если нужен человек — оставьте заявку.
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setTimeout(() => {
            setBusy(false);
            toast.success("Заявка отправлена");
          }, 400);
        }}
      >
        <div>
          <Label>Тема</Label>
          <Input required defaultValue="Не сходится ФНО 910 и акт сверки с КазТех" />
        </div>
        <div>
          <Label>Сообщение</Label>
          <Textarea required defaultValue="Нужен человек: проверить черновик 910 и п. 7.2 договора. Срок — до 12 октября." />
        </div>
        <Button type="submit" variant="accent" loading={busy}>
          Отправить
        </Button>
      </form>
    </div>
  );
}
