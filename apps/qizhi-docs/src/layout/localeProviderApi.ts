import type { LocaleProviderProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type LocaleProviderApiItem = ComponentApiItem<keyof LocaleProviderProps>;

export const localeProviderApi = [
  { name: "children", description: "共享语言上下文的子树。", type: "ReactNode", defaultValue: "—" },
  { name: "locale", description: "受控语言。", type: '"zh-CN" | "en-US"', defaultValue: "—" },
  { name: "defaultLocale", description: "非受控初始语言。", type: '"zh-CN" | "en-US"', defaultValue: '"zh-CN"' },
  { name: "messages", description: "按语言合并的业务文案字典。", type: "Partial<Record<QizhiLocale, LocaleMessages>>", defaultValue: "—" },
  { name: "storageKey", description: "持久化语言选择所用的 localStorage 键。", type: "string", defaultValue: "—" },
  { name: "onLocaleChange", description: "全局语言变化时触发。", type: "(locale: QizhiLocale) => void", defaultValue: "—" },
] as const satisfies readonly LocaleProviderApiItem[];
