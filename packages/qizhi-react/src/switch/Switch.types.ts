import type {
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
  Ref,
} from "react";

export type SwitchSize = "default" | "small";

export interface SwitchProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "defaultChecked" | "onChange" | "size"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: SwitchSize;
  checkedText?: ReactNode;
  uncheckedText?: ReactNode;
  onChange?: (checked: boolean, event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLButtonElement>;
}
