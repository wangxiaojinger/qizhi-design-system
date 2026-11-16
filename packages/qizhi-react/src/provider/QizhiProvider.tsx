import { App as AntApp, ConfigProvider, type ConfigProviderProps } from "antd";
import { useLayoutEffect, type PropsWithChildren } from "react";
import { qizhiComponentConfig } from "../theme/component-config";
import { createQizhiTheme } from "../theme/antd-theme";

export type QizhiTheme = "light" | "dark";
export interface QizhiProviderProps extends PropsWithChildren { locale?: ConfigProviderProps["locale"]; theme?: QizhiTheme; }

export function QizhiProvider({ children, locale, theme = "light" }: QizhiProviderProps) {
  useLayoutEffect(() => {
    if (theme === "dark") document.body.dataset.theme = "dark";
    else delete document.body.dataset.theme;
    return () => { delete document.body.dataset.theme; };
  }, [theme]);
  return <ConfigProvider {...qizhiComponentConfig} locale={locale} theme={createQizhiTheme()}><AntApp>{children}</AntApp></ConfigProvider>;
}
