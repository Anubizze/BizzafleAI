"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { registerSchema, type RegisterValues } from "@/components/auth/schemas";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  async function onSubmit(values: RegisterValues) {
    if (isDemoMode) {
      enterDemoSession();
      toast.success("Демо-кабинет");
      router.push("/dashboard");
      return;
    }
    try {
      const payload = await authApi.register({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      });
      setAuth(payload.user, payload.accessToken);
      toast.success("Аккаунт создан");
      router.push(payload.user.onboardingCompleted ? "/dashboard" : "/onboarding");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Не удалось зарегистрироваться");
    }
  }

  return (
    <AuthShell title={t("auth.register.title")} subtitle={t("auth.register.subtitle")}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="name">{t("auth.name")}</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="mt-1 text-sm text-danger">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="mt-1 text-sm text-danger">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="phone">{t("auth.phone")}</Label>
          <Input id="phone" type="tel" placeholder="+7" {...form.register("phone")} />
          {form.formState.errors.phone ? (
            <p className="mt-1 text-sm text-danger">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="mt-1 text-sm text-danger">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" variant="accent" className="w-full" loading={form.formState.isSubmitting}>
          {t("auth.register.submit")}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">
          Войти
        </Link>
      </p>
    </AuthShell>
  );
}
