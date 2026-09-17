import type { CSSProperties, ReactNode } from "react";

export interface DrawerProps {
  open: boolean;
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  escToClose?: boolean;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}
