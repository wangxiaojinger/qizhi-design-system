import type { MouseEvent, ReactElement, ReactNode } from "react";
import type { ButtonNativeProps } from "../button/Button.types";
import type { PopoverPosition } from "../popover/Popover.types";

export interface PopconfirmProps {
  children: ReactElement;
  title?: ReactNode;
  content?: ReactNode;
  position?: PopoverPosition;
  icon?: ReactNode | null;
  disabled?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okButtonProps?: PopconfirmButtonProps;
  cancelButtonProps?: PopconfirmButtonProps;
  onOk?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onCancel?: (event: MouseEvent<HTMLButtonElement>) => void;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  getPopupContainer?: (trigger: HTMLElement) => Element;
}

export type PopconfirmButtonProps = Omit<
  ButtonNativeProps,
  "children" | "onClick"
>;
