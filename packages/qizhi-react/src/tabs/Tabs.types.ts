import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";

export type TabsKey = string | number;
export type TabsType = "line" | "card" | "card-gutter" | "text" | "capsule";
export type TabsPosition = "top" | "left" | "right";
export type TabsSize = "small" | "default" | "large";
export type TabsScrollPosition = "auto" | "start" | "center" | "end";

export interface TabsItem {
  key: TabsKey;
  title: ReactNode;
  content: ReactNode;
  panelId?: string;
  disabled?: boolean;
}

export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  items: readonly TabsItem[];
  activeKey?: TabsKey;
  defaultActiveKey?: TabsKey;
  onChange?: (key: TabsKey) => void;
  type?: TabsType;
  position?: TabsPosition;
  size?: TabsSize;
  scrollPosition?: TabsScrollPosition;
  renderContent?: boolean;
  showDivider?: boolean;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}
