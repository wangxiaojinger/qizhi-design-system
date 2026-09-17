import type { CSSProperties, ReactNode } from "react";

export type NotificationType = "info" | "success" | "warning" | "error" | "normal";
export type NotificationPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface NotificationConfig {
  title: ReactNode;
  content?: ReactNode;
  duration?: number;
  position?: NotificationPosition;
  closable?: boolean;
  showIcon?: boolean;
  id?: string;
  btn?: ReactNode;
  icon?: ReactNode;
  closeIcon?: ReactNode;
  className?: string | string[];
  style?: CSSProperties;
  onClose?: () => void;
}

export interface NotificationGlobalConfig {
  maxCount?: number;
  duration?: number;
  getContainer?: () => HTMLElement;
}

export type NotificationClose = () => void;
export type NotificationMethod = (config: NotificationConfig) => NotificationClose;

export interface NotificationApi {
  info: NotificationMethod;
  success: NotificationMethod;
  warning: NotificationMethod;
  error: NotificationMethod;
  normal: NotificationMethod;
  remove: (id: string) => void;
  clear: () => void;
}

export interface NotificationStaticApi extends NotificationApi {
  config: (options: NotificationGlobalConfig) => void;
}
