"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usersApi } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user?.name ?? "Владислав");
  const [phone, setPhone] = useState(user?.phone ?? "+77011234567");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const next = await usersApi.update({ name, phone });
      setUser(next);
      toast.success("Профиль обновлён");
    } catch (error) {
      if (user) setUser({ ...user, name, phone });
      toast.error(error instanceof ApiError ? error.message : "Не удалось сохранить на сервере");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Профиль</p>
        <h1 className="display mt-2 text-5xl">{user?.name ?? "Владислав"}</h1>
        <p className="mt-2 text-ink-muted">{user?.email ?? "demo@bizaffle.ai"}</p>
      </div>
      <div>
        <Label>Имя</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>Телефон</Label>
        <Input value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <Button variant="accent" loading={busy} onClick={save}>
        Сохранить
      </Button>
    </div>
  );
}
