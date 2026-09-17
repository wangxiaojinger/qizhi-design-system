import type { CSSProperties, FormHTMLAttributes, ReactNode, Ref } from "react";

export type FormLayout = "vertical" | "horizontal";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  layout?: FormLayout;
  ref?: Ref<HTMLFormElement>;
}

export interface FormItemProps {
  label?: ReactNode;
  required?: boolean;
  extra?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface FormComponent {
  (props: FormProps): ReactNode;
  Item: (props: FormItemProps) => ReactNode;
}

