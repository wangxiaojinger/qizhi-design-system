import type { HTMLAttributes, ReactNode } from "react";

export type DividerType = "horizontal" | "vertical";
export type DividerLineStyle = "solid" | "dashed" | "dotted";
export type DividerOrientation = "left" | "center" | "right";

export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children?: ReactNode;
  type?: DividerType;
  lineStyle?: DividerLineStyle;
  orientation?: DividerOrientation;
}
