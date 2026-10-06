"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { loginSchema, type LoginValues } from "@/components/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { isDemoMode } from "@/lib/demo-mode";
import { enterDemoSession } from "@/lib/demo-session";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@bizaffle.ai", password: "Demo1234!" },
  });

  async function onSubmit(values: LoginValues) {
    if (isDemoMode) {
      enterDemoSession();
      toast.success("Демо-кабинет");
      router.push(params.get("next") || "/dashboard");
      return;
    }
    try {
      const payload = await authApi.login(values.email, values.password);
      setAuth(payload.user, payload.accessToken);
      toast.success("Вы вошли");
      const next = params.get("next");
      if (next) router.push(next);
      else router.push(payload.user.onboardingCompleted ? "/dashboard" : "/onboarding");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Не удалось войти");
    }
  }

  return (
    <AuthShell title={t("auth.login.title")} subtitle={t("auth.login.subtitle")}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="mt-1 text-sm text-danger">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="mt-1 text-sm text-danger">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" variant="accent" className="w-full" loading={form.formState.isSubmitting}>
          {t("auth.login.submit")}
        </Button>
        {isDemoMode ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              enterDemoSession();
              router.push("/dashboard");
            }}
          >
            Открыть демо без пароля
          </Button>
        ) : null}
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-ink underline underline-offset-4">
          Создать
        </Link>
        {" · "}
        <Link href="/forgot-password" className="text-ink underline underline-offset-4">
          Забыли пароль
        </Link>
      </p>
      <p className="mt-6 text-xs text-ink-faint">{t("auth.demo")}</p>
    </AuthShell>
  );
}
