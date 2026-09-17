import type { ReactElement, ReactNode } from "react";
import type { FloatingPosition } from "../overlay/floatingPosition";

export type TooltipPosition = FloatingPosition;
export type TooltipTrigger = "hover" | "focus" | "click";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger | TooltipTrigger[];
  mini?: boolean;
  color?: string;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  getPopupContainer?: (trigger: HTMLElement) => Element;
}
