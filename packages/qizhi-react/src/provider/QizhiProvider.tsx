import { App as AntApp, ConfigProvider, type ConfigProviderProps } from "antd";
import { createContext, useContext, useLayoutEffect, useMemo, useState, type PropsWithChildren } from "react";
import { createQizhiComponentConfig, type QizhiFormConfig } from "../theme/component-config";
import { createQizhiTheme } from "../theme/antd-theme";

export type { QizhiFormConfig } from "../theme/component-config";
export type QizhiTheme = "light" | "dark";
export interface QizhiProviderProps extends PropsWithChildren {
  /** QIZHI owns the only Ant Design ThemeConfig for this React root. */
  theme?: QizhiTheme;
  locale?: ConfigProviderProps["locale"];
  direction?: ConfigProviderProps["direction"];
  componentSize?: ConfigProviderProps["componentSize"];
  componentDisabled?: ConfigProviderProps["componentDisabled"];
  prefixCls?: ConfigProviderProps["prefixCls"];
  iconPrefixCls?: ConfigProviderProps["iconPrefixCls"];
  getPopupContainer?: ConfigProviderProps["getPopupContainer"];
  getTargetContainer?: ConfigProviderProps["getTargetContainer"];
  csp?: ConfigProviderProps["csp"];
  /** Behaviour-only Form defaults. QIZHI retains Form styles and class names. */
  form?: QizhiFormConfig;
}

const QizhiThemeOwnerContext = createContext(false);

export function QizhiProvider({
  children,
  componentDisabled,
  componentSize,
  csp,
  direction,
  form,
  getPopupContainer,
  getTargetContainer,
  iconPrefixCls,
  locale,
  prefixCls,
  theme = "light",
}: QizhiProviderProps) {
  if (useContext(QizhiThemeOwnerContext) && import.meta.env.DEV) {
    console.warn("QizhiProvider must be mounted once per React root because it owns the Ant Design theme.");
  }
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
  const componentConfig = useMemo(() => createQizhiComponentConfig(form), [form]);
  return (
    <QizhiThemeOwnerContext.Provider value>
      <ConfigProvider
        {...componentConfig}
        componentDisabled={componentDisabled}
        componentSize={componentSize}
        csp={csp}
        direction={direction}
        getPopupContainer={getPopupContainer}
        getTargetContainer={getTargetContainer}
        iconPrefixCls={iconPrefixCls}
        locale={locale}
        prefixCls={prefixCls}
        theme={antdTheme}
      >
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </QizhiThemeOwnerContext.Provider>
  );
}
