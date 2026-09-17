import type { CSSProperties, FocusEventHandler, KeyboardEventHandler, ReactNode } from "react";

export type InputNumberValue = number | string;
export type InputNumberMode = "embed" | "button";
export type InputNumberSize = "small" | "default" | "large";
export type InputNumberControls = "hover" | "always" | "hidden";

export interface InputNumberFormatterInfo {
  userTyping: boolean;
  input: string;
}

export interface InputNumberProps {
  value?: InputNumberValue;
  defaultValue?: InputNumberValue;
  onChange?: (value: InputNumberValue | undefined) => void;
  min?: InputNumberValue;
  max?: InputNumberValue;
  step?: InputNumberValue;
  precision?: number;
  mode?: InputNumberMode;
  controls?: InputNumberControls;
  size?: InputNumberSize;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  formatter?: (value: InputNumberValue | undefined, info: InputNumberFormatterInfo) => string;
  parser?: (displayValue: string) => InputNumberValue;
  strictMode?: boolean;
  className?: string;
  style?: CSSProperties;
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}
