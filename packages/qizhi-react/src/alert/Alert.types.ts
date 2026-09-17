import type { HTMLAttributes, ReactNode } from "react";

export type AlertType = "info" | "success" | "warning" | "error" | "neutral";
export type AlertSize = "small" | "default" | "large";
export type AlertCloseElement = ReactNode | ((close: () => void) => ReactNode);

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "content"
> {
  content: ReactNode;
  title?: ReactNode;
  type?: AlertType;
  size?: AlertSize;
  inline?: boolean;
  banner?: boolean;
  closable?: boolean;
  showIcon?: boolean;
  icon?: ReactNode;
  closeElement?: AlertCloseElement;
  onClose?: () => void;
}
