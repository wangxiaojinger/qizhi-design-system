import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type InputTagSize = "small" | "default" | "large";
export interface InputTagLabelValue { label: string; value: string }
export type InputTagValue = string | InputTagLabelValue | Record<string, unknown>;
export type InputTagValidationResult = boolean | InputTagValue;

export interface InputTagProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: InputTagValue[];
  defaultValue?: InputTagValue[];
  onChange?: (value: InputTagValue[]) => void;
  labelInValue?: boolean;
  size?: InputTagSize;
  placeholder?: string;
  allowClear?: boolean;
  onClear?: () => void;
  validate?: (input: string, value: InputTagValue[]) => InputTagValidationResult;
  saveOnBlur?: boolean;
  tokenSeparators?: string[];
  maxTagCount?: number | "responsive";
  renderMore?: (hiddenCount: number) => ReactNode;
  inputStyle?: CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
