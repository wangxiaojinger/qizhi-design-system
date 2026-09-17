import { createContext, useContext, useMemo, useState } from "react";
import type { LocaleContextValue, LocaleMessages, LocaleProviderProps, QizhiLocale } from "./LocaleProvider.types";

const builtInMessages: Record<QizhiLocale, LocaleMessages> = {
  "zh-CN": {
    "common.close": "关闭", "common.restore": "重新显示", "common.viewAll": "查看全部", "common.collapse": "收起",
    "platform.ariaLabel": "启智平台框架", "platform.greetingAriaLabel": "问候语", "platform.greeting": "Good day，欢迎使用 启智 开启新的一天 😃",
    "navigation.ariaLabel": "启智顶部导航", "navigation.productName": "启智", "navigation.tenantName": "租户名称XX", "navigation.workbench": "工作台", "navigation.customModel": "定制模型", "navigation.modelService": "模型服务", "navigation.explore": "探索", "navigation.operations": "运营中心", "navigation.help": "资源/帮助",
    "navigation.region.qibao": "七宝机房", "navigation.region.qibaoShort": "七宝", "navigation.region.songjiang": "松江机房", "navigation.region.songjiangShort": "松江", "navigation.region.zhangjiang": "张江科研二号楼1楼404机房", "navigation.region.zhangjiangShort": "张江", "navigation.region.disabled": "张江科研三号楼机房",
    "businessGuide.closed": "业务引导已关闭", "businessGuide.closeAriaLabel": "关闭业务引导",
    "taskOverview.title": "任务概览", "taskOverview.all": "全部", "taskOverview.space": "空间：{name}", "taskOverview.filterAriaLabel": "筛选空间", "taskOverview.groupAriaLabel": "筛选任务类型",
    "taskCard.resource": "资源规格：", "taskCard.duration": "已运行时长：", "projectCard.englishName": "项目英文名", "projectCard.members": "成员列表", "projectCard.manageMembers": "管理项目成员",
  },
  "en-US": {
    "common.close": "Close", "common.restore": "Show again", "common.viewAll": "View all", "common.collapse": "Collapse",
    "platform.ariaLabel": "QIZHI platform shell", "platform.greetingAriaLabel": "Greeting", "platform.greeting": "Good day, welcome to QIZHI. Start a new day 😃",
    "navigation.ariaLabel": "QIZHI top navigation", "navigation.productName": "QIZHI", "navigation.tenantName": "Tenant name", "navigation.workbench": "Workbench", "navigation.customModel": "Custom models", "navigation.modelService": "Model services", "navigation.explore": "Explore", "navigation.operations": "Operations", "navigation.help": "Resources/Help",
    "navigation.region.qibao": "Qibao Data Center", "navigation.region.qibaoShort": "Qibao", "navigation.region.songjiang": "Songjiang Data Center", "navigation.region.songjiangShort": "Songjiang", "navigation.region.zhangjiang": "Zhangjiang Research Building 2, Room 404", "navigation.region.zhangjiangShort": "Zhangjiang", "navigation.region.disabled": "Zhangjiang Research Building 3",
    "businessGuide.closed": "The guide is closed", "businessGuide.closeAriaLabel": "Close guide",
    "taskOverview.title": "Task overview", "taskOverview.all": "All", "taskOverview.space": "Space: {name}", "taskOverview.filterAriaLabel": "Filter by space", "taskOverview.groupAriaLabel": "Filter task type",
    "taskCard.resource": "Resources: ", "taskCard.duration": "Elapsed: ", "projectCard.englishName": "English name", "projectCard.members": "Members", "projectCard.manageMembers": "Manage project members",
  },
};

const defaultValue: LocaleContextValue = {
  locale: "zh-CN", setLocale: () => undefined,
  t: (key, fallback) => fallback ?? builtInMessages["zh-CN"][key] ?? key,
  formatNumber: (value, options) => new Intl.NumberFormat("zh-CN", options).format(value),
  formatDate: (value, options) => new Intl.DateTimeFormat("zh-CN", options).format(new Date(value)),
};
const LocaleContext = createContext<LocaleContextValue>(defaultValue);

export function LocaleProvider({ children, locale: controlledLocale, defaultLocale = "zh-CN", messages, storageKey, onLocaleChange }: LocaleProviderProps) {
  const [internalLocale, setInternalLocale] = useState<QizhiLocale>(() => {
    if (!storageKey || typeof window === "undefined") return defaultLocale;
    const stored = window.localStorage.getItem(storageKey);
    return stored === "zh-CN" || stored === "en-US" ? stored : defaultLocale;
  });
  const locale = controlledLocale ?? internalLocale;
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: (nextLocale) => {
      if (controlledLocale === undefined) setInternalLocale(nextLocale);
      if (storageKey && typeof window !== "undefined") window.localStorage.setItem(storageKey, nextLocale);
      onLocaleChange?.(nextLocale);
    },
    t: (key, fallback) => messages?.[locale]?.[key] ?? builtInMessages[locale][key] ?? fallback ?? key,
    formatNumber: (number, options) => new Intl.NumberFormat(locale, options).format(number),
    formatDate: (date, options) => new Intl.DateTimeFormat(locale, options).format(new Date(date)),
  }), [controlledLocale, locale, messages, onLocaleChange, storageKey]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
export const interpolateLocaleMessage = (message: string, params?: Record<string, string | number>) =>
  params ? message.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`)) : message;
