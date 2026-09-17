import type { InputProps } from "../input/Input.types";
import type { CSSProperties, ReactElement, ReactNode, Ref } from "react";

export interface AutoCompleteOption {
  value: string;
  label?: ReactNode;
  group?: ReactNode;
  disabled?: boolean;
}

export interface AutoCompleteOptionProps extends AutoCompleteOption {
  children?: ReactNode;
}

export type AutoCompleteFilter = false | ((inputValue: string, option: AutoCompleteOption) => boolean);

export interface AutoCompleteProps
  extends Omit<InputProps, "allowClear" | "children" | "className" | "defaultValue" | "onChange" | "onClear" | "onSelect" | "style" | "value"> {
  children?: ReactNode;
  data?: readonly (string | AutoCompleteOption)[];
  value?: string;
  defaultValue?: string;
  strict?: boolean;
  filterOption?: AutoCompleteFilter;
  triggerElement?: ReactElement;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement | HTMLTextAreaElement>;
}

export interface AutoCompleteComponent {
  (props: AutoCompleteProps): ReactNode;
  Option: (props: AutoCompleteOptionProps) => null;
}
