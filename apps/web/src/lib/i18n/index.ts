import {
  defaultLocale,
  dictionaries,
  type Locale,
} from "@/lib/i18n/messages";

const STORAGE_KEY = "bizaffle-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ru" || value === "kk" || value === "en";
}

export function getLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : defaultLocale;
}

export function setLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  window.dispatchEvent(new CustomEvent("bizaffle:locale", { detail: locale }));
}

export function t(key: string, locale?: Locale): string {
  const loc = locale ?? getLocale();
  return dictionaries[loc]?.[key] ?? dictionaries.ru[key] ?? key;
}

export { defaultLocale, dictionaries, localeLabels } from "@/lib/i18n/messages";
export type { Locale } from "@/lib/i18n/messages";
