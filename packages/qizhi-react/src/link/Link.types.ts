import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";

export type LinkStatus = "default" | "error" | "success" | "warning";
export type LinkClassName = string | string[];
export type LinkHandle = HTMLButtonElement | HTMLAnchorElement;

interface LinkBaseProps {
  status?: LinkStatus;
  disabled?: boolean;
  hoverable?: boolean;
  icon?: boolean | ReactNode;
  children?: ReactNode;
  className?: LinkClassName;
  style?: CSSProperties;
}

export type LinkButtonProps = LinkBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof LinkBaseProps | "type" | "onClick"> & {
    href?: never;
    htmlType?: "button" | "submit" | "reset";
    onClick?: MouseEventHandler<HTMLButtonElement>;
  };

export type LinkAnchorProps = LinkBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkBaseProps | "href" | "onClick"> & {
    href: string;
    htmlType?: never;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  };

export type LinkProps = LinkButtonProps | LinkAnchorProps;
