import type { ThemeConfig } from "antd";

export function cssToken(name: string) {
  if (typeof window === "undefined") return undefined;
  const target = document.body ?? document.documentElement;
  return window.getComputedStyle(target).getPropertyValue(name).trim() || undefined;
}

export function cssNumberToken(name: string) {
  const value = cssToken(name);
  const numeric = value ? Number.parseFloat(value) : Number.NaN;
  return Number.isFinite(numeric) ? numeric : undefined;
}

export function createQizhiTheme(): ThemeConfig {
  return {
    cssVar: { prefix: "qizhi" },
    token: {
      colorPrimary: cssToken("--admin-primary"),
      colorPrimaryHover: cssToken("--admin-primary-hover"),
      colorPrimaryActive: cssToken("--admin-primary-active"),
      colorInfo: cssToken("--admin-info"),
      colorText: cssToken("--admin-foreground"),
      colorTextSecondary: cssToken("--admin-muted-foreground"),
      colorTextLightSolid: cssToken("--admin-primary-foreground"),
      colorBgBase: cssToken("--admin-background"),
      colorBgContainer: cssToken("--admin-card"),
      colorBgElevated: cssToken("--admin-popover"),
      colorBorder: cssToken("--admin-input"),
      colorBorderSecondary: cssToken("--admin-border"),
      colorSuccess: cssToken("--admin-success"),
      colorWarning: cssToken("--admin-warning"),
      colorError: cssToken("--admin-destructive"),
      fontFamily: cssToken("--font-family-default"),
      fontSize: cssNumberToken("--font-size-base"),
      fontWeightStrong: cssNumberToken("--font-weight-strong"),
      borderRadius: cssNumberToken("--radius-6"),
      borderRadiusLG: cssNumberToken("--radius-8"),
      controlHeight: cssNumberToken("--control-height-md"),
      controlHeightSM: cssNumberToken("--control-height-sm"),
      controlHeightLG: cssNumberToken("--control-height-lg"),
      boxShadowSecondary: cssToken("--shadow-elevation-200-menu-panel"),
    },
    components: {
      Table: {
        headerBg: cssToken("--component-table-header-background"),
        rowHoverBg: cssToken("--component-table-row-hover-background"),
        borderColor: cssToken("--admin-border"),
        cellPaddingInline: cssNumberToken("--spacing-16"),
      },
      Input: {
        colorBgContainer: cssToken("--component-input-background"),
        colorBorder: cssToken("--component-input-border"),
        hoverBorderColor: cssToken("--admin-ring"),
        activeBorderColor: cssToken("--admin-primary"),
        activeShadow: "none",
      },
      Select: {
        colorBgContainer: cssToken("--component-input-background"),
        colorBorder: cssToken("--component-input-border"),
        hoverBorderColor: cssToken("--admin-ring"),
        activeBorderColor: cssToken("--admin-primary"),
        activeOutlineColor: "transparent",
      },
      Drawer: {
        colorBgElevated: cssToken("--admin-popover"),
        colorBgMask: cssToken("--component-modal-mask"),
        zIndexPopup: cssNumberToken("--z-modal"),
      },
      Modal: {
        colorBgMask: cssToken("--component-modal-mask"),
        contentBg: cssToken("--admin-popover"),
      },
      Tabs: { inkBarColor: cssToken("--admin-primary") },
      Pagination: { colorPrimary: cssToken("--admin-primary") },
    },
  };
}
