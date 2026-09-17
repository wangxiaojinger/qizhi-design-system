import type { CSSProperties, ReactNode } from "react";
import type { ButtonNativeProps } from "../button/Button.types";

export interface ModalProps {
  open: boolean;
  title: ReactNode;
  children?: ReactNode;
  width?: number | string;
  footer?: ReactNode;
  onCancel?: () => void;
  onOk?: () => void | Promise<void>;
  cancelText?: ReactNode;
  okText?: ReactNode;
  cancelButtonProps?: ButtonNativeProps;
  okButtonProps?: ButtonNativeProps;
  confirmLoading?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  escToExit?: boolean;
  hideCancel?: boolean;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}

export interface ModalConfirmConfig {
  title: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okButtonProps?: ButtonNativeProps;
  cancelButtonProps?: ButtonNativeProps;
  closable?: boolean;
  maskClosable?: boolean;
  escToExit?: boolean;
  hideCancel?: boolean;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ModalConfirmHandle {
  update: (next: Partial<ModalConfirmConfig>) => void;
  close: () => void;
}

export interface ModalComponent {
  (props: ModalProps): ReactNode;
  confirm: (config: ModalConfirmConfig) => ModalConfirmHandle;
}
