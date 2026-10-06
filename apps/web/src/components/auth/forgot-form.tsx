"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { forgotSchema, type ForgotValues } from "@/components/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { t } from "@/lib/i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ForgotForm() {
  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotValues) {
    try {
      await authApi.forgotPassword(values.email);
      toast.success("Если аккаунт существует, мы отправили письмо");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Не удалось отправить письмо");
    }
  }

  return (
    <AuthShell title={t("auth.forgot.title")} subtitle={t("auth.forgot.subtitle")}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <Button type="submit" variant="accent" className="w-full" loading={form.formState.isSubmitting}>
          {t("auth.forgot.submit")}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        <Link href="/login" className="underline underline-offset-4">
          Назад ко входу
        </Link>
      </p>
    </AuthShell>
  );
}
