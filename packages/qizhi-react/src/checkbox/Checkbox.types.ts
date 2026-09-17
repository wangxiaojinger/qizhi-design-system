import type {
  ChangeEvent,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";

export type CheckboxValue = string | number;
export type CheckboxDirection = "horizontal" | "vertical";

export interface CheckboxOption {
  label: ReactNode;
  value: CheckboxValue;
  disabled?: boolean;
}

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "children" | "type" | "size" | "value" | "checked" | "defaultChecked" | "onChange" | "className" | "style"
  > {
  children?: ReactNode;
  value?: CheckboxValue;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

export interface CheckboxGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  children?: ReactNode;
  options?: readonly (CheckboxValue | CheckboxOption)[];
  value?: readonly CheckboxValue[];
  defaultValue?: readonly CheckboxValue[];
  disabled?: boolean;
  direction?: CheckboxDirection;
  onChange?: (values: CheckboxValue[], event: ChangeEvent<HTMLInputElement>) => void;
}

export interface CheckboxComponent {
  (props: CheckboxProps): ReactNode;
  Group: (props: CheckboxGroupProps) => ReactNode;
}
