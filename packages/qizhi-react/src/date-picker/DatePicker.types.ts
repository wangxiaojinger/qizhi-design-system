import type { CSSProperties, ReactNode } from "react";
import type { InputStatus } from "../input/Input.types";

export type DatePickerMode = "date" | "week" | "month" | "year" | "quarter";
export interface DisabledTimeConfig {
  disabledHours?: readonly number[];
  disabledMinutes?: readonly number[];
  disabledSeconds?: readonly number[];
}

interface DatePickerSharedProps {
  mode?: DatePickerMode;
  showTime?: boolean;
  status?: InputStatus;
  prefix?: ReactNode;
  placeholder?: string;
  allowClear?: boolean;
  disabledDate?: (date: Date) => boolean;
  disabledTime?: (date: Date | undefined, field?: "start" | "end") => DisabledTimeConfig;
  hideDisabledTimeOptions?: boolean;
  defaultPickerDate?: string;
  className?: string;
  style?: CSSProperties;
}

export interface DatePickerProps extends DatePickerSharedProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface DateRangePickerProps extends DatePickerSharedProps {
  value?: readonly [string, string] | readonly [];
  defaultValue?: readonly [string, string] | readonly [];
  onChange?: (value: [string, string] | []) => void;
}

export interface DatePickerComponent {
  (props: DatePickerProps): ReactNode;
  RangePicker: (props: DateRangePickerProps) => ReactNode;
}
