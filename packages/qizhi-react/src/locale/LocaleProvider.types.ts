import type { ReactNode } from "react";

export type QizhiLocale = "zh-CN" | "en-US";
export type LocaleMessages = Record<string, string>;

export interface LocaleProviderProps {
  children: ReactNode;
  locale?: QizhiLocale;
  defaultLocale?: QizhiLocale;
  messages?: Partial<Record<QizhiLocale, LocaleMessages>>;
  storageKey?: string;
  onLocaleChange?: (locale: QizhiLocale) => void;
}

export interface LocaleContextValue {
  locale: QizhiLocale;
  setLocale: (locale: QizhiLocale) => void;
  t: (key: string, fallback?: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
}
