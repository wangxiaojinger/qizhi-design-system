import type { CSSProperties, ReactNode } from "react";
import type { TooltipPosition } from "../tooltip/Tooltip.types";

export type SliderRangeValue = [number, number];
export type SliderMultipleValue = [number, number, number, ...number[]];
export type SliderValue = number | SliderRangeValue | SliderMultipleValue;

export interface SliderRangeConfig {
  draggableBar?: boolean;
}

export interface SliderBaseProps {
  min?: number;
  max?: number;
  step?: number;
  vertical?: boolean;
  disabled?: boolean;
  marks?: Record<number, ReactNode>;
  tooltipVisible?: boolean;
  tooltipPosition?: TooltipPosition;
  formatterTooltip?: (value: number) => ReactNode;
  getPopupContainer?: (trigger: HTMLElement) => Element;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export interface SliderSingleProps extends SliderBaseProps {
  range?: false;
  multiple?: false;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
}

export interface SliderRangeProps extends SliderBaseProps {
  range: true | SliderRangeConfig;
  multiple?: false;
  value?: SliderRangeValue;
  defaultValue?: SliderRangeValue;
  onChange?: (value: SliderRangeValue) => void;
  onChangeComplete?: (value: SliderRangeValue) => void;
}

export interface SliderMultipleProps extends SliderBaseProps {
  range?: false;
  multiple: true;
  value?: SliderMultipleValue;
  defaultValue?: SliderMultipleValue;
  onChange?: (value: SliderMultipleValue) => void;
  onChangeComplete?: (value: SliderMultipleValue) => void;
}

export type SliderProps =
  | SliderSingleProps
  | SliderRangeProps
  | SliderMultipleProps;
