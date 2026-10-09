import type { CSSProperties, ReactNode } from "react";
import type { ButtonNativeProps } from "../button/Button.types";

export type ModalContainer = HTMLElement | string | (() => HTMLElement) | false;

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
  destroyOnHidden?: boolean;
  afterClose?: () => void;
  getContainer?: ModalContainer;
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
  icon?: ReactNode | null;
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
  afterClose?: () => void;
  getContainer?: ModalContainer;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ModalConfirmHandle {
  update: (next: Partial<ModalConfirmConfig>) => void;
  close: () => void;
}

export interface ModalHookApi {
  confirm: (config: ModalConfirmConfig) => ModalConfirmHandle;
}

export interface ModalComponent {
  (props: ModalProps): ReactNode;
  confirm: (config: ModalConfirmConfig) => ModalConfirmHandle;
  useModal: () => readonly [ModalHookApi, ReactNode];
}
