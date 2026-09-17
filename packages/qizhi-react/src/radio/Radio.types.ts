import type {
  ChangeEvent,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";

export type RadioValue = string | number;
export type RadioType = "radio" | "button";
export type RadioSize = "small" | "default" | "large";

export interface RadioOption {
  label: ReactNode;
  value: RadioValue;
  disabled?: boolean;
}

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "children" | "type" | "size" | "value" | "checked" | "defaultChecked" | "onChange" | "className" | "style"
  > {
  children?: ReactNode;
  value?: RadioValue;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  type?: RadioType;
  size?: RadioSize;
  onChange?: (checked: boolean, value: RadioValue | undefined, event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

export interface RadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  children?: ReactNode;
  options?: readonly (RadioValue | RadioOption)[];
  value?: RadioValue;
  defaultValue?: RadioValue;
  disabled?: boolean;
  type?: RadioType;
  size?: RadioSize;
  name?: string;
  onChange?: (value: RadioValue, event: ChangeEvent<HTMLInputElement>) => void;
}

export interface RadioComponent {
  (props: RadioProps): ReactNode;
  Group: (props: RadioGroupProps) => ReactNode;
}
