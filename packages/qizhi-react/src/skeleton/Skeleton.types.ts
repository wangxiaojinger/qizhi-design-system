import type { HTMLAttributes, Ref } from "react";

export type SkeletonImageShape = "square" | "circle";
export type SkeletonWidth = number | string;

export interface SkeletonImageConfig {
  shape?: SkeletonImageShape;
  size?: number;
}

export interface SkeletonTextConfig {
  rows?: number;
  widths?: readonly SkeletonWidth[];
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  animation?: boolean;
  image?: boolean | SkeletonImageConfig;
  text?: boolean | SkeletonTextConfig;
  ref?: Ref<HTMLDivElement>;
}
