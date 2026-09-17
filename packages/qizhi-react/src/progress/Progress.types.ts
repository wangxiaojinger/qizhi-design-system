import type { HTMLAttributes, Ref } from "react";

export type ProgressType = "line" | "circle";
export type ProgressStatus = "normal" | "warning" | "danger" | "success";
export type ProgressSize = "small" | "default" | "large" | "mini";
export type ProgressGradient = Record<number, string>;

interface ProgressCommonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "color"> {
  percent?: number;
  status?: ProgressStatus;
  color?: string | ProgressGradient;
  trailColor?: string;
  animation?: boolean;
  steps?: number;
  stepWidth?: number;
  strokeWidth?: number;
  ref?: Ref<HTMLDivElement>;
}

export interface ProgressLineProps extends ProgressCommonProps {
  type?: "line";
  size?: Exclude<ProgressSize, "mini">;
}

export interface ProgressCircleProps extends ProgressCommonProps {
  type: "circle";
  size?: ProgressSize;
}

export type ProgressProps = ProgressLineProps | ProgressCircleProps;
