import type { ReactNode } from "react";
import type { SideNavigationProps } from "../side-navigation/SideNavigation.types";
import type { TopNavigationProps } from "../top-navigation/TopNavigation.types";

export interface PlatformShellProps {
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  topNavigationProps?: Omit<
    TopNavigationProps,
    "selectedKey" | "defaultSelectedKey" | "onSelect"
  >;
  sideNavigationProps?: Omit<SideNavigationProps, "variant">;
  stickyHeader?: boolean;
  greeting?: ReactNode;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}
