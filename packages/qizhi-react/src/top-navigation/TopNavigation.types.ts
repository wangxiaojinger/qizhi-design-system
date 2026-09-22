import type { ReactNode, UIEvent } from "react";

export interface TopNavigationItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  group?: "primary" | "secondary";
}

export interface TopNavigationOption {
  key: string;
  label: ReactNode;
  shortLabel?: string;
  disabled?: boolean;
}

export interface TopNavigationProps {
  logo?: ReactNode;
  productName?: ReactNode;
  tenantName?: ReactNode;
  items?: readonly TopNavigationItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  /** 替换区域控件；传入 null 时隐藏，undefined 时保留默认控件。 */
  regionSelector?: ReactNode;
  /** 隐藏区域控件，同时保留其布局宽度和最后一次可见标签。 */
  regionHidden?: boolean;
  /** 锚定在默认头像按钮上的用户菜单内容。 */
  userMenu?: ReactNode;
  /** 替换帮助操作；传入 null 时隐藏。 */
  utility?: ReactNode;
  languageAriaLabel?: string;
  userMenuAriaLabel?: string;
  regions?: readonly TopNavigationOption[];
  region?: string;
  defaultRegion?: string;
  onRegionChange?: (key: string) => void;
  onRegionPopupScroll?: (event: UIEvent<HTMLDivElement>) => void;
  languages?: readonly TopNavigationOption[];
  language?: string;
  defaultLanguage?: string;
  onLanguageChange?: (key: string) => void;
  helpLabel?: ReactNode;
  onHelp?: () => void;
  onUserMenu?: () => void;
  className?: string;
  "aria-label"?: string;
}
