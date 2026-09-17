import type { CSSProperties, ReactNode, Ref } from "react";
import type { InputStatus } from "../input/Input.types";

export type TimePickerSize = "mini" | "small" | "default" | "large";
export type TimePickerFormat = "HH:mm:ss" | "HH:mm";

export interface TimePickerStep {
  hour?: number;
  minute?: number;
  second?: number;
}

interface TimePickerSharedProps {
  format?: TimePickerFormat;
  step?: TimePickerStep;
  size?: TimePickerSize;
  status?: InputStatus;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface TimePickerProps extends TimePickerSharedProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export interface TimeRangePickerProps extends TimePickerSharedProps {
  value?: readonly [string, string] | readonly [];
  defaultValue?: readonly [string, string] | readonly [];
  onChange?: (value: [string, string] | []) => void;
  placeholders?: readonly [string, string];
}

export interface TimePickerComponent {
  (props: TimePickerProps): ReactNode;
  RangePicker: (props: TimeRangePickerProps) => ReactNode;
}
