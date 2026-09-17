import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";

export type TagSize = "small" | "default" | "medium" | "large";

export type TagPresetColor =
  | "red"
  | "orangered"
  | "orange"
  | "gold"
  | "lime"
  | "green"
  | "cyan"
  | "blue"
  | "qizhiblue"
  | "purple"
  | "pinkpurple"
  | "magenta"
  | "gray";

export type TagChangeEvent = MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color" | "onChange"> {
  children?: ReactNode;
  icon?: ReactNode;
  size?: TagSize;
  color?: TagPresetColor | (string & {});
  bordered?: boolean;
  closable?: boolean;
  closeAriaLabel?: string;
  visible?: boolean;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  checkable?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: TagChangeEvent) => void;
}
