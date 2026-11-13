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
  disabled?: boolean;
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
  placeholders?: readonly [string, string];
  inputLabels?: readonly [string, string];
  editable?: boolean;
  closeOnValueChange?: boolean;
  onOpenChange?: (open: boolean) => void;
  separator?: ReactNode;
  validateRange?: (value: [string, string]) => string | undefined;
  /** Footer actions return a validation message to keep the panel open. */
  shortcuts?: readonly { key: string; label: ReactNode; onSelect: () => string | undefined }[];
  value?: readonly [string, string] | readonly [];
  defaultValue?: readonly [string, string] | readonly [];
  onChange?: (value: [string, string] | []) => void;
}

export interface DatePickerComponent {
  (props: DatePickerProps): ReactNode;
  RangePicker: (props: DateRangePickerProps) => ReactNode;
}
