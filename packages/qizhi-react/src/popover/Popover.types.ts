import type { CSSProperties, ReactElement, ReactNode } from "react";

export type PopoverTrigger = "hover" | "click" | "focus" | "contextMenu";
export type PopoverPosition =
  | "topLeft" | "top" | "topRight"
  | "bottomLeft" | "bottom" | "bottomRight"
  | "leftTop" | "left" | "leftBottom"
  | "rightTop" | "right" | "rightBottom";
export type PopoverRole = "tooltip" | "dialog" | "menu";
export type PopoverVariant = "light" | "dark";
export type PopoverSemanticName = "root" | "title" | "content" | "arrow";

export interface PopoverHandle {
  forceAlign: () => void;
}

export interface PopoverProps {
  children: ReactElement;
  title?: ReactNode;
  content: ReactNode;
  trigger?: PopoverTrigger | PopoverTrigger[];
  position?: PopoverPosition;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  getPopupContainer?: (trigger: HTMLElement) => Element;
  role?: PopoverRole;
  ariaLabel?: string;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  arrow?: boolean;
  zIndex?: number;
  classNames?: Partial<Record<PopoverSemanticName, string>>;
  styles?: Partial<Record<PopoverSemanticName, CSSProperties>>;
  variant?: PopoverVariant;
}
