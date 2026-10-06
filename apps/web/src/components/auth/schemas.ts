import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().min(10, "Укажите телефон").optional().or(z.literal("")),
  password: z.string().min(8, "Минимум 8 символов"),
});

export const forgotSchema = z.object({
  email: z.string().email("Введите корректный email"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
