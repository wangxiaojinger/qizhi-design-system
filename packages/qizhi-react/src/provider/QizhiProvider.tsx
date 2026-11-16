import { App as AntApp, ConfigProvider, type ConfigProviderProps } from "antd";
import { useLayoutEffect, useMemo, useState, type PropsWithChildren } from "react";
import { qizhiComponentConfig } from "../theme/component-config";
import { createQizhiTheme } from "../theme/antd-theme";

export type QizhiTheme = "light" | "dark";
export interface QizhiProviderProps extends PropsWithChildren { locale?: ConfigProviderProps["locale"]; theme?: QizhiTheme; }

export function QizhiProvider({ children, locale, theme = "light" }: QizhiProviderProps) {
  const [themeRevision, setThemeRevision] = useState(0);
  useLayoutEffect(() => {
    if (theme === "dark") document.body.dataset.theme = "dark";
    else delete document.body.dataset.theme;
    // CSS variables change with the body attribute. Rebuild AntD's ThemeConfig
    // in the same layout pass so its JS tokens and the stylesheet stay aligned.
    setThemeRevision((revision) => revision + 1);
    return () => { delete document.body.dataset.theme; };
  }, [theme]);
  const antdTheme = useMemo(() => createQizhiTheme(), [theme, themeRevision]);
  return <ConfigProvider {...qizhiComponentConfig} locale={locale} theme={antdTheme}><AntApp>{children}</AntApp></ConfigProvider>;
}
