import type { ReactElement, ReactNode } from "react";

export type PopoverTrigger = "hover" | "click" | "focus" | "contextMenu";
export type PopoverPosition =
  | "topLeft" | "top" | "topRight"
  | "bottomLeft" | "bottom" | "bottomRight"
  | "leftTop" | "left" | "leftBottom"
  | "rightTop" | "right" | "rightBottom";
export type PopoverRole = "tooltip" | "dialog" | "menu";

export interface PopoverProps {
  children: ReactElement;
  title?: ReactNode;
  content: ReactNode;
  trigger?: PopoverTrigger;
  position?: PopoverPosition;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  getPopupContainer?: (trigger: HTMLElement) => Element;
  role?: PopoverRole;
}
