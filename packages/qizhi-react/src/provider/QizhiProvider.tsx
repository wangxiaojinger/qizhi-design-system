import { App as AntApp, ConfigProvider, type ConfigProviderProps } from "antd";
import { useLayoutEffect, useMemo, useState, type PropsWithChildren } from "react";
import { qizhiComponentConfig } from "../theme/component-config";
import { createQizhiTheme } from "../theme/antd-theme";

export type QizhiTheme = "light" | "dark";
export interface QizhiProviderProps extends PropsWithChildren { locale?: ConfigProviderProps["locale"]; theme?: QizhiTheme; }

export function QizhiProvider({ children, locale, theme = "light" }: QizhiProviderProps) {
  const [themeRevision, setThemeRevision] = useState(0);
  useLayoutEffect(() => {
    const roots = [document.documentElement, document.body];
    if (theme === "dark") roots.forEach((root) => { root.dataset.theme = "dark"; });
    else roots.forEach((root) => { delete root.dataset.theme; });
    // CSS variables change with the body attribute. Rebuild AntD's ThemeConfig
    // in the same layout pass so its JS tokens and the stylesheet stay aligned.
    setThemeRevision((revision) => revision + 1);
    return () => { roots.forEach((root) => { delete root.dataset.theme; }); };
  }, [theme]);
  const antdTheme = useMemo(() => createQizhiTheme(), [theme, themeRevision]);
  return <ConfigProvider {...qizhiComponentConfig} locale={locale} theme={antdTheme}><AntApp>{children}</AntApp></ConfigProvider>;
}
