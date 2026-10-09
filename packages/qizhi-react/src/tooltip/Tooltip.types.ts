import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { FloatingPosition } from "../overlay/floatingPosition";

export type TooltipPosition = FloatingPosition;
export type TooltipTrigger = "hover" | "focus" | "click";
export type TooltipSemanticName = "root" | "container" | "arrow";

export interface TooltipHandle {
  forceAlign: () => void;
}

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
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  arrow?: boolean;
  zIndex?: number;
  classNames?: Partial<Record<TooltipSemanticName, string>>;
  styles?: Partial<Record<TooltipSemanticName, CSSProperties>>;
}
