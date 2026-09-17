import { useState } from "react";
import { Layout } from "../layout/Layout";
import { SideNavigation } from "../side-navigation/SideNavigation";
import type { SideNavigationVariant } from "../side-navigation/SideNavigation.types";
import { TopNavigation } from "../top-navigation/TopNavigation";
import { useLocale } from "../locale/LocaleProvider";
import type { PlatformShellProps } from "./PlatformShell.types";

const sideVariants = new Set([
  "custom-model",
  "model-service",
  "agent",
  "explore",
  "operations",
]);

const joinClassNames = (...names: Array<string | undefined>) =>
  names.filter(Boolean).join(" ");

export function PlatformShell({
  selectedKey,
  defaultSelectedKey,
  onSelect,
  topNavigationProps,
  sideNavigationProps,
  stickyHeader = false,
  greeting,
  children,
  className,
  "aria-label": ariaLabel,
}: PlatformShellProps) {
  const { t } = useLocale();
  const controlled = selectedKey !== undefined;
  const [internalSelectedKey, setInternalSelectedKey] = useState(
    defaultSelectedKey ?? "workbench",
  );
  const currentKey = controlled ? selectedKey : internalSelectedKey;
  const sideVariant = sideVariants.has(currentKey)
    ? currentKey as SideNavigationVariant
    : undefined;

  const select = (key: string) => {
    if (!controlled) setInternalSelectedKey(key);
    onSelect?.(key);
  };

  return (
    <section
      className={joinClassNames(
        "qizhi-platform-shell",
        stickyHeader ? "is-header-sticky" : undefined,
        className,
      )}
      data-mode={currentKey}
      aria-label={ariaLabel ?? t("platform.ariaLabel")}
    >
      <Layout.Header className="qizhi-platform-shell__header">
        <TopNavigation
          {...topNavigationProps}
          selectedKey={currentKey}
          onSelect={select}
        />
      </Layout.Header>
      <Layout className="qizhi-platform-shell__body">
        {sideVariant ? (
          <Layout.Sider className="qizhi-platform-shell__sider">
            <SideNavigation
              {...sideNavigationProps}
              variant={sideVariant}
            />
          </Layout.Sider>
        ) : null}
        <Layout.Content className="qizhi-platform-shell__main">
          {greeting !== null ? (
            <div
              className="qizhi-platform-shell__greeting"
              role="region"
              aria-label={t("platform.greetingAriaLabel")}
            >
              {greeting ?? t("platform.greeting")}
            </div>
          ) : null}
          {children}
        </Layout.Content>
      </Layout>
    </section>
  );
}
