import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
} from "react";

export type TimelineDirection = "vertical" | "horizontal";
export type TimelineMode = "left" | "right" | "alternate";
export type TimelineLabelPosition = "same" | "relative";
export type TimelineItemPosition = "left" | "right";
export type TimelineDotType = "solid" | "hollow";
export type TimelineLineType = "solid" | "dashed";

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  direction?: TimelineDirection;
  mode?: TimelineMode;
  reverse?: boolean;
  labelPosition?: TimelineLabelPosition;
  pending?: ReactNode;
  pendingDot?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  dot?: ReactNode;
  dotColor?: string;
  dotType?: TimelineDotType;
  lineType?: TimelineLineType;
  position?: TimelineItemPosition;
  ref?: Ref<HTMLDivElement>;
}

export interface TimelineItemInternalProps extends TimelineItemProps {
  isLast?: boolean;
  labelPosition?: TimelineLabelPosition;
}

export type TimelineStyle = CSSProperties & {
  "--qizhi-timeline-dot-color"?: string;
};

