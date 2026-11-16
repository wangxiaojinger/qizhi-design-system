import type { ThemeConfig } from "antd";

export function cssToken(name: string) {
  if (typeof window === "undefined") return undefined;
  return window.getComputedStyle(document.body ?? document.documentElement).getPropertyValue(name).trim() || undefined;
}

export function cssNumberToken(name: string) {
  const value = Number.parseFloat(cssToken(name) ?? "");
  return Number.isFinite(value) ? value : undefined;
}

const sumCssNumberTokens = (...names: string[]) => {
  const values = names.map(cssNumberToken);
  return values.some((value) => value === undefined) ? undefined : values.reduce<number>((total, value) => total + value!, 0);
};

const divideCssNumberToken = (name: string, divisor: number) => {
  const value = cssNumberToken(name);
  return value === undefined || !Number.isFinite(divisor) || divisor === 0 ? undefined : value / divisor;
};

const ratioCssNumberTokens = (dividendName: string, divisorName: string) => {
  const dividend = cssNumberToken(dividendName);
  const divisor = cssNumberToken(divisorName);
  return dividend === undefined || divisor === undefined || divisor === 0 ? undefined : dividend / divisor;
};

const centeredBlockPadding = (controlName: string, lineHeightName: string) => {
  const control = cssNumberToken(controlName);
  const lineHeight = cssNumberToken(lineHeightName);
  return control === undefined || lineHeight === undefined || control < lineHeight ? undefined : (control - lineHeight) / 2;
};

const centeredBoxPadding = (totalHeight: number | undefined, contentHeight: number | undefined, borderWidth: number | undefined) => {
  return totalHeight === undefined || contentHeight === undefined || borderWidth === undefined || totalHeight < contentHeight + borderWidth
    ? undefined
    : (totalHeight - contentHeight - borderWidth) / 2;
};

const pixelPair = (block: number | undefined, inline: number | undefined) => block === undefined || inline === undefined ? undefined : `${block}px ${inline}px`;
const blockEndMargin = (value: number | undefined) => value === undefined ? undefined : `0 0 ${value}px 0`;

function listPageThemeComponents(): NonNullable<ThemeConfig["components"]> {
  const zero = cssNumberToken("--spacing-0");
  const one = divideCssNumberToken("--spacing-2", 2);
  const controlHeight = cssNumberToken("--control-height-md");
  const tableRowHeight = sumCssNumberTokens("--control-height-xl", "--spacing-8");
  const tableCellPaddingBlock = centeredBoxPadding(tableRowHeight, controlHeight, one);
  const tabsBlockPadding = centeredBlockPadding("--control-height-lg", "--line-height-base");

  return {
    Table: {
      headerBg: cssToken("--bg-bg-base-secondary"), headerColor: cssToken("--admin-foreground"),
      rowHoverBg: cssToken("--admin-accent"), rowSelectedBg: cssToken("--admin-accent"), rowSelectedHoverBg: cssToken("--admin-accent"),
      borderColor: cssToken("--admin-border"), headerSplitColor: cssToken("--bg-bg-base-secondary"),
      cellPaddingBlock: tableCellPaddingBlock, cellPaddingInline: cssNumberToken("--spacing-16"), headerBorderRadius: zero,
    },
    Tabs: {
      inkBarColor: cssToken("--admin-primary"), itemColor: cssToken("--admin-foreground"), itemHoverColor: cssToken("--admin-primary-hover"),
      itemActiveColor: cssToken("--admin-primary-active"), itemSelectedColor: cssToken("--admin-primary"),
      horizontalMargin: blockEndMargin(cssNumberToken("--spacing-16")), horizontalItemGutter: zero,
      horizontalItemPadding: pixelPair(tabsBlockPadding, cssNumberToken("--spacing-12")),
      titleFontSize: cssNumberToken("--font-size-lg"), lineWidthBold: cssNumberToken("--spacing-2"),
    },
    Input: {
      controlHeight, borderRadius: cssNumberToken("--radius-8"), colorBgContainer: cssToken("--admin-card"),
      colorBorder: cssToken("--admin-input"), paddingInline: cssNumberToken("--spacing-12"), paddingBlock: cssNumberToken("--spacing-4"),
      hoverBorderColor: cssToken("--admin-ring"), activeBorderColor: cssToken("--admin-primary"), activeShadow: "none",
    },
    InputNumber: { colorBgContainer: cssToken("--admin-card"), colorBorder: cssToken("--admin-input"), hoverBorderColor: cssToken("--admin-ring"), activeBorderColor: cssToken("--admin-primary") },
    Select: {
      colorBgContainer: cssToken("--admin-card"), colorBorder: cssToken("--admin-input"), hoverBorderColor: cssToken("--admin-ring"), activeBorderColor: cssToken("--admin-primary"),
      activeOutlineColor: "transparent", optionSelectedBg: cssToken("--admin-accent"), optionSelectedColor: cssToken("--admin-accent-foreground"), controlItemBgActiveHover: cssToken("--admin-accent"),
    },
    Segmented: { trackBg: cssToken("--admin-muted"), trackPadding: cssNumberToken("--spacing-2") },
    Checkbox: { colorPrimary: cssToken("--admin-primary"), colorPrimaryHover: cssToken("--admin-primary-hover") },
    Radio: { colorPrimary: cssToken("--admin-primary"), colorPrimaryHover: cssToken("--admin-primary-hover") },
    Button: { controlHeight, borderRadius: cssNumberToken("--radius-8"), fontWeight: cssNumberToken("--font-weight-medium"), primaryColor: cssToken("--admin-primary-foreground"), iconGap: cssNumberToken("--spacing-8") },
    Switch: { colorPrimary: cssToken("--control-accent"), colorPrimaryHover: cssToken("--control-accent-hover"), handleBg: cssToken("--admin-card"), handleShadow: cssToken("--shadow-elevation-100-tooltip") },
    Pagination: {
      colorPrimary: cssToken("--admin-primary"), colorPrimaryHover: cssToken("--admin-primary-hover"), borderRadius: cssNumberToken("--radius-6"),
      itemBg: cssToken("--admin-card"), itemLinkBg: cssToken("--admin-card"), itemInputBg: cssToken("--admin-card"),
      itemActiveBg: cssToken("--admin-primary"), itemActiveColor: cssToken("--admin-primary-foreground"), itemActiveColorHover: cssToken("--admin-primary-foreground"),
      itemSize: controlHeight, itemSizeSM: cssNumberToken("--control-height-xs"), itemSizeLG: cssNumberToken("--control-height-lg"),
    },
  };
}

export function createQizhiTheme(): ThemeConfig {
  const one = divideCssNumberToken("--spacing-2", 2);
  const controlHeight = cssNumberToken("--control-height-md");
  return {
    cssVar: { prefix: "qizhi" },
    token: {
      colorPrimary: cssToken("--admin-primary"), colorPrimaryHover: cssToken("--admin-primary-hover"), colorPrimaryActive: cssToken("--admin-primary-active"),
      colorInfo: cssToken("--admin-info"), colorLink: cssToken("--admin-primary"), colorLinkHover: cssToken("--admin-primary-hover"), colorLinkActive: cssToken("--admin-primary-active"),
      colorText: cssToken("--admin-foreground"), colorTextSecondary: cssToken("--admin-muted-foreground"), colorTextDisabled: cssToken("--text-text-disabled"), colorTextLightSolid: cssToken("--admin-primary-foreground"),
      colorBgBase: cssToken("--admin-background"), colorBgContainer: cssToken("--admin-card"), colorBgElevated: cssToken("--admin-popover"), colorBgLayout: cssToken("--admin-background"),
      colorBorder: cssToken("--admin-input"), colorBorderSecondary: cssToken("--admin-border"), colorSplit: cssToken("--admin-border"),
      colorSuccess: cssToken("--status-success-default"), colorWarning: cssToken("--status-warning-default"), colorError: cssToken("--status-error-default"),
      fontFamily: cssToken("--font-family-default"), fontSize: cssNumberToken("--font-size-base"), fontWeightStrong: cssNumberToken("--font-weight-strong"),
      lineHeight: ratioCssNumberTokens("--line-height-base", "--font-size-base"), lineWidth: one, lineWidthBold: one, controlOutlineWidth: one,
      borderRadius: cssNumberToken("--radius-6"), borderRadiusLG: cssNumberToken("--radius-8"), controlHeight,
      controlHeightSM: cssNumberToken("--control-height-sm"), controlHeightLG: cssNumberToken("--control-height-lg"), boxShadowSecondary: cssToken("--shadow-elevation-200-menu-panel"),
    },
    components: {
      Layout: { bodyBg: cssToken("--admin-background"), headerBg: cssToken("--admin-sidebar"), headerColor: cssToken("--admin-foreground"), headerHeight: sumCssNumberTokens("--control-height-xl", "--spacing-8"), headerPadding: cssToken("--spacing-0"), siderBg: cssToken("--admin-sidebar"), lightSiderBg: cssToken("--admin-sidebar") },
      Popover: { colorBgElevated: cssToken("--admin-popover"), borderRadiusLG: cssNumberToken("--radius-8"), zIndexPopup: cssNumberToken("--z-dropdown") },
      Dropdown: { colorBgElevated: cssToken("--admin-popover"), borderRadiusLG: cssNumberToken("--radius-8"), boxShadowSecondary: cssToken("--shadow-elevation-200-menu-panel"), zIndexPopup: cssNumberToken("--z-dropdown") },
      Card: { colorBgContainer: cssToken("--admin-card"), colorText: cssToken("--admin-card-foreground"), colorBorderSecondary: cssToken("--admin-border"), headerBg: cssToken("--admin-card"), actionsBg: cssToken("--admin-card") },
      Modal: { colorBgMask: cssToken("--special-modal-mask"), contentBg: cssToken("--admin-popover"), headerBg: cssToken("--admin-popover"), footerBg: cssToken("--admin-popover"), titleColor: cssToken("--admin-popover-foreground") },
      Drawer: { colorBgElevated: cssToken("--admin-popover"), colorBgMask: cssToken("--special-modal-mask"), colorText: cssToken("--admin-popover-foreground"), zIndexPopup: cssNumberToken("--z-modal") },
      Form: { itemMarginBottom: cssNumberToken("--spacing-24") },
      Tooltip: { colorBgSpotlight: cssToken("--admin-foreground"), colorTextLightSolid: cssToken("--admin-background") },
      ...listPageThemeComponents(),
    },
  };
}
