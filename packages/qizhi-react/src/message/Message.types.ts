import type { CSSProperties, ReactNode } from "react";

export type MessageType = "info" | "success" | "warning" | "error" | "normal" | "loading";
export type MessagePosition = "top" | "bottom";

export interface MessageConfig {
  content: ReactNode;
  closable?: boolean;
  showIcon?: boolean;
  duration?: number;
  id?: string;
  position?: MessagePosition;
  closeIcon?: ReactNode;
  icon?: ReactNode;
  className?: string | string[];
  style?: CSSProperties;
  onClose?: () => void;
}

export interface MessageGlobalConfig {
  maxCount?: number;
  getContainer?: () => HTMLElement;
  duration?: number;
}

export type MessageInput = ReactNode | MessageConfig;
export type MessageClose = () => void;
export type MessageMethod = (input: MessageInput) => MessageClose;

export interface MessageApi {
  info: MessageMethod;
  success: MessageMethod;
  warning: MessageMethod;
  error: MessageMethod;
  normal: MessageMethod;
  loading: MessageMethod;
  clear: () => void;
}

export interface MessageStaticApi extends MessageApi {
  config: (options: MessageGlobalConfig) => void;
}
