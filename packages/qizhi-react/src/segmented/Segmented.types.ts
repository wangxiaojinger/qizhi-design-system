import type { HTMLAttributes, ReactNode } from "react";

export type SegmentedValue = string | number;

export interface SegmentedOption {
  label: ReactNode;
  value: SegmentedValue;
  disabled?: boolean;
}

export interface SegmentedProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: readonly SegmentedOption[];
  value?: SegmentedValue;
  defaultValue?: SegmentedValue;
  name?: string;
  disabled?: boolean;
  onChange?: (value: SegmentedValue) => void;
}
