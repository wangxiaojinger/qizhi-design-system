import type { ReactNode } from "react";

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
  regions?: readonly TopNavigationOption[];
  region?: string;
  defaultRegion?: string;
  onRegionChange?: (key: string) => void;
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
