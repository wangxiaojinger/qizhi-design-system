import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

export type MenuMode = "horizontal" | "vertical";

export interface MenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  mode?: MenuMode;
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface MenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  itemKey: string;
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface MenuGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  children?: ReactNode;
}

export interface MenuComponent {
  (props: MenuProps): ReactElement;
  Item: (props: MenuItemProps) => ReactElement;
  Group: (props: MenuGroupProps) => ReactElement;
}
