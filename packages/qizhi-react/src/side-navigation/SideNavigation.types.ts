import type { ReactNode, UIEvent } from "react";

export type SideNavigationVariant =
  | "custom-model"
  | "model-service"
  | "agent"
  | "explore"
  | "operations";

export interface SideNavigationItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SideNavigationGroup {
  title: ReactNode;
  items: readonly SideNavigationItem[];
}

export interface SideNavigationProps {
  variant?: SideNavigationVariant;
  groups?: readonly SideNavigationGroup[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  workspaces?: readonly string[];
  workspace?: string;
  defaultWorkspace?: string;
  showWorkspaceSwitcher?: boolean;
  onWorkspaceChange?: (workspace: string) => void;
  onWorkspacePopupScroll?: (event: UIEvent<HTMLDivElement>) => void;
  className?: string;
  "aria-label"?: string;
}
