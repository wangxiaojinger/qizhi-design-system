import type { ButtonHTMLAttributes, HTMLAttributes, MouseEvent, ReactElement, ReactNode } from "react";

export type DropdownPosition = "top" | "tl" | "tr" | "bottom" | "bl" | "br";
export type DropdownTrigger = "hover" | "click";

export interface DropdownProps {
  children: ReactElement;
  droplist: ReactNode;
  position?: DropdownPosition;
  trigger?: DropdownTrigger;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  className?: string;
}

export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  onClickMenuItem?: (key: string, event: MouseEvent<HTMLButtonElement>) => void;
}

export interface DropdownItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  itemKey: string;
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface DropdownSubMenuProps {
  /** 根据可用空间向左或向右展开嵌套菜单，默认向右。 */
  placement?: "left" | "right";
  itemKey: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface DropdownButtonProps {
  children: ReactNode;
  droplist: ReactNode;
  type?: "primary" | "secondary";
  position?: DropdownPosition;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  toggleIcon?: ReactNode;
  "aria-label"?: string;
}

export interface DropdownComponent {
  (props: DropdownProps): ReactElement;
  Menu: (props: DropdownMenuProps) => ReactElement;
  Item: (props: DropdownItemProps) => ReactElement;
  SubMenu: (props: DropdownSubMenuProps) => ReactElement;
  Button: (props: DropdownButtonProps) => ReactElement;
}
