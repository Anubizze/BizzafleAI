import { ForgotForm } from "@/components/auth/forgot-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Сброс пароля" };

export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
