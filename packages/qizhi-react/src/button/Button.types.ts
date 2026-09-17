import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLProps,
  MouseEventHandler,
  ReactNode,
} from "react";

export type ButtonType = "default" | "primary" | "secondary" | "dashed" | "text";
export type ButtonSize = "mini" | "small" | "default" | "large";
export type ButtonStatus = "default" | "warning" | "danger" | "success";
export type ButtonClassName = string | string[];
export type ButtonIconPosition = "before" | "after";
export type ButtonHandle = HTMLButtonElement | HTMLAnchorElement;

interface ButtonBaseProps {
  type?: ButtonType;
  size?: ButtonSize;
  status?: ButtonStatus;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
  iconOnly?: boolean;
  loading?: boolean;
  loadingFixedWidth?: boolean;
  long?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: ButtonClassName;
  style?: CSSProperties;
}

export type ButtonNativeProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps | "type" | "onClick"> & {
    href?: never;
    target?: never;
    anchorProps?: never;
    htmlType?: "button" | "submit" | "reset";
    onClick?: MouseEventHandler<HTMLButtonElement>;
  };

export type ButtonLinkProps = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | "type" | "href" | "target" | "onClick"> & {
    href: string;
    target?: string;
    anchorProps?: HTMLProps<HTMLAnchorElement>;
    htmlType?: never;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  };

export type ButtonProps = ButtonNativeProps | ButtonLinkProps;
