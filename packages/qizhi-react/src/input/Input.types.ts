import type {
  ChangeEventHandler,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEventHandler,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export type InputSize = "mini" | "small" | "default" | "large";
export type InputStatus = "default" | "error" | "warning";
export type InputNormalizeTrigger = "blur" | "enter";
export interface InputLengthLimit { length: number; errorOnly?: boolean }
export interface InputAutoWidth { minWidth?: number; maxWidth?: number }

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix" | "maxLength"> {
  size?: InputSize;
  status?: InputStatus;
  allowClear?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  addBefore?: ReactNode;
  addAfter?: ReactNode;
  maxLength?: number | InputLengthLimit;
  showWordLimit?: boolean;
  normalize?: (value: string) => string;
  normalizeTrigger?: InputNormalizeTrigger;
  autoWidth?: boolean | InputAutoWidth;
  onClear?: () => void;
}

export interface InputSearchProps extends Omit<InputProps, "allowClear" | "onClear"> {
  searchButton?: boolean | ReactNode;
  loading?: boolean;
  onSearch?: (value: string) => void;
}

export interface InputPasswordProps extends Omit<InputProps, "type" | "suffix"> {
  defaultVisibility?: boolean;
  visibility?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export interface InputTextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "maxLength"> {
  status?: InputStatus;
  maxLength?: number | InputLengthLimit;
  showWordLimit?: boolean;
  wordLimitPlacement?: "inside" | "outside";
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface InputComponent {
  (props: InputProps & { ref?: React.Ref<HTMLInputElement> }): React.ReactNode;
  Search: (props: InputSearchProps & { ref?: React.Ref<HTMLInputElement> }) => React.ReactNode;
  Password: (props: InputPasswordProps & { ref?: React.Ref<HTMLInputElement> }) => React.ReactNode;
  TextArea: (props: InputTextAreaProps & { ref?: React.Ref<HTMLTextAreaElement> }) => React.ReactNode;
  Group: (props: InputGroupProps) => React.ReactNode;
}

export type InputKeyDownHandler = KeyboardEventHandler<HTMLInputElement>;
